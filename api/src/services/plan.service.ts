import { TRPCError } from '@trpc/server'
import { and, asc, eq, sql } from 'drizzle-orm'
import type { Database } from '../@types/database.type'
import type {
  CompleteDayInput,
  CurrentPlan,
  DayCompletion,
  DayInput,
  PlanDay,
  PlanDetail,
  PlanEnrollment,
  PlanSummary,
} from '../@types/plan.type'
import { PLAN_ERRORS } from '../constants/plan.constant'
import { TRPC_ERRORS } from '../constants/trpc.constant'
import { dayCompletions, planDays, planEnrollments, plans } from '../database/schema.database'
import { dayCopy, planCopy } from '../i18n/content'
import type { ContentLanguage } from '../i18n/language'

const totalDaysColumn = sql<number>`count(${planDays.dayNumber})`.mapWith(Number)

function throwNotFound(message: string): never {
  throw new TRPCError({ code: TRPC_ERRORS.NOT_FOUND, message })
}

function toDayCompletion(row: typeof dayCompletions.$inferSelect): DayCompletion {
  return {
    planId: row.planId,
    dayNumber: row.dayNumber,
    reflection: row.reflection,
    completedAt: row.completedAt.toISOString(),
  }
}

async function findPlanWithTotalDays(database: Database, planId: string) {
  const [found] = await database
    .select({ plan: plans, totalDays: totalDaysColumn })
    .from(plans)
    .leftJoin(planDays, eq(planDays.planId, plans.id))
    .where(eq(plans.id, planId))
    .groupBy(plans.id)
  return found ?? throwNotFound(PLAN_ERRORS.PLAN_NOT_FOUND)
}

export async function listPlans(
  database: Database,
  language: ContentLanguage = 'pt-BR',
): Promise<PlanSummary[]> {
  const rows = await database
    .select({ plan: plans, totalDays: totalDaysColumn })
    .from(plans)
    .leftJoin(planDays, eq(planDays.planId, plans.id))
    .groupBy(plans.id)
    .orderBy(asc(plans.position))
  return rows.map(({ plan, totalDays }) => ({
    id: plan.id,
    title: planCopy(plan.id, language)?.title ?? plan.title,
    category: plan.category,
    totalDays,
  }))
}

export async function getPlanDetail(
  database: Database,
  userId: string,
  planId: string,
  language: ContentLanguage = 'pt-BR',
): Promise<PlanDetail> {
  const { plan, totalDays } = await findPlanWithTotalDays(database, planId)
  const days = await database
    .select({ dayNumber: planDays.dayNumber, title: planDays.title, summary: planDays.summary })
    .from(planDays)
    .where(eq(planDays.planId, planId))
    .orderBy(asc(planDays.dayNumber))
  const [enrollment] = await database
    .select({ planId: planEnrollments.planId })
    .from(planEnrollments)
    .where(and(eq(planEnrollments.userId, userId), eq(planEnrollments.planId, planId)))
  const completions = await database
    .select({ completion: dayCompletions, dayTitle: planDays.title })
    .from(dayCompletions)
    .innerJoin(
      planDays,
      and(
        eq(planDays.planId, dayCompletions.planId),
        eq(planDays.dayNumber, dayCompletions.dayNumber),
      ),
    )
    .where(and(eq(dayCompletions.userId, userId), eq(dayCompletions.planId, planId)))
    .orderBy(asc(dayCompletions.dayNumber))
  const localizedPlan = planCopy(plan.id, language)
  return {
    id: plan.id,
    title: localizedPlan?.title ?? plan.title,
    category: plan.category,
    totalDays,
    description: localizedPlan?.description ?? plan.description,
    isEnrolled: enrollment !== undefined,
    completedDayNumbers: completions.map(({ completion }) => completion.dayNumber),
    days: days.map((day) => {
      const localizedDay = dayCopy(planId, day.dayNumber, language)
      return {
        ...day,
        title: localizedDay?.title ?? day.title,
        summary: localizedDay?.summary ?? day.summary,
      }
    }),
    reflections: completions.flatMap(({ completion, dayTitle }) =>
      completion.reflection === null
        ? []
        : [
            {
              dayNumber: completion.dayNumber,
              dayTitle: dayCopy(planId, completion.dayNumber, language)?.title ?? dayTitle,
              text: completion.reflection,
              completedAt: completion.completedAt.toISOString(),
            },
          ],
    ),
  }
}

export async function findPlanDay(
  database: Database,
  userId: string,
  input: DayInput,
  language: ContentLanguage = 'pt-BR',
): Promise<PlanDay> {
  const [found] = await database
    .select({ day: planDays, plan: plans })
    .from(planDays)
    .innerJoin(plans, eq(plans.id, planDays.planId))
    .where(and(eq(planDays.planId, input.planId), eq(planDays.dayNumber, input.dayNumber)))
  if (!found) {
    throwNotFound(PLAN_ERRORS.DAY_NOT_FOUND)
  }
  const { totalDays } = await findPlanWithTotalDays(database, input.planId)
  const [completion] = await database
    .select()
    .from(dayCompletions)
    .where(
      and(
        eq(dayCompletions.userId, userId),
        eq(dayCompletions.planId, input.planId),
        eq(dayCompletions.dayNumber, input.dayNumber),
      ),
    )
  const localizedPlan = planCopy(found.plan.id, language)
  const localizedDay = dayCopy(found.plan.id, found.day.dayNumber, language)
  return {
    planId: found.plan.id,
    planTitle: localizedPlan?.title ?? found.plan.title,
    totalDays,
    dayNumber: found.day.dayNumber,
    title: localizedDay?.title ?? found.day.title,
    videoDurationSeconds: found.day.videoDurationSeconds,
    message: localizedDay?.message ?? found.day.message,
    reflection: localizedDay?.reflection ?? found.day.reflection,
    action: localizedDay?.action ?? found.day.action,
    tip: localizedDay?.tip ?? found.day.tip,
    prayer: localizedDay?.prayer ?? found.day.prayer,
    completion: completion
      ? { reflection: completion.reflection, completedAt: completion.completedAt.toISOString() }
      : null,
  }
}

// Insert-then-select keeps the call idempotent even when two requests race: the loser of the
// insert reads the row the winner wrote.
async function ensureEnrollment(
  database: Database,
  userId: string,
  planId: string,
): Promise<PlanEnrollment> {
  await database
    .insert(planEnrollments)
    .values({ userId, planId, startedAt: new Date() })
    .onConflictDoNothing()
  const [enrollment] = await database
    .select()
    .from(planEnrollments)
    .where(and(eq(planEnrollments.userId, userId), eq(planEnrollments.planId, planId)))
  return { planId: enrollment.planId, startedAt: enrollment.startedAt.toISOString() }
}

export async function startPlan(
  database: Database,
  userId: string,
  planId: string,
): Promise<PlanEnrollment> {
  await findPlanWithTotalDays(database, planId)
  return ensureEnrollment(database, userId, planId)
}

export async function completeDay(
  database: Database,
  userId: string,
  input: CompleteDayInput,
): Promise<DayCompletion> {
  const [day] = await database
    .select({ dayNumber: planDays.dayNumber })
    .from(planDays)
    .where(and(eq(planDays.planId, input.planId), eq(planDays.dayNumber, input.dayNumber)))
  if (!day) {
    throwNotFound(PLAN_ERRORS.DAY_NOT_FOUND)
  }
  await ensureEnrollment(database, userId, input.planId)
  await database
    .insert(dayCompletions)
    .values({
      userId,
      planId: input.planId,
      dayNumber: input.dayNumber,
      reflection: input.reflection ?? null,
      completedAt: new Date(),
    })
    .onConflictDoNothing()
  const [completion] = await database
    .select()
    .from(dayCompletions)
    .where(
      and(
        eq(dayCompletions.userId, userId),
        eq(dayCompletions.planId, input.planId),
        eq(dayCompletions.dayNumber, input.dayNumber),
      ),
    )
  return toDayCompletion(completion)
}

// The current plan is the unfinished enrollment with the latest activity, meaning the greater of
// its start and its last completion. Ties keep the plan that comes first in the catalog.
export async function findCurrentPlan(
  database: Database,
  userId: string,
  language: ContentLanguage = 'pt-BR',
): Promise<CurrentPlan | null> {
  const enrollments = await database
    .select({ plan: plans, startedAt: planEnrollments.startedAt, totalDays: totalDaysColumn })
    .from(planEnrollments)
    .innerJoin(plans, eq(plans.id, planEnrollments.planId))
    .leftJoin(planDays, eq(planDays.planId, plans.id))
    .where(eq(planEnrollments.userId, userId))
    .groupBy(plans.id)
    .orderBy(asc(plans.position))
  const completions = await database
    .select()
    .from(dayCompletions)
    .where(eq(dayCompletions.userId, userId))

  let current: CurrentPlan | null = null
  let latestActivity = Number.NEGATIVE_INFINITY
  for (const enrollment of enrollments) {
    const planCompletions = completions.filter(
      (completion) => completion.planId === enrollment.plan.id,
    )
    if (planCompletions.length >= enrollment.totalDays) {
      continue
    }
    const activity = Math.max(
      enrollment.startedAt.getTime(),
      ...planCompletions.map((completion) => completion.completedAt.getTime()),
    )
    if (activity > latestActivity) {
      const completedDayNumbers = new Set(planCompletions.map((completion) => completion.dayNumber))
      let nextDayNumber = 1
      while (completedDayNumbers.has(nextDayNumber)) {
        nextDayNumber += 1
      }
      latestActivity = activity
      current = {
        planId: enrollment.plan.id,
        title: planCopy(enrollment.plan.id, language)?.title ?? enrollment.plan.title,
        totalDays: enrollment.totalDays,
        completedDays: planCompletions.length,
        nextDayNumber,
      }
    }
  }
  return current
}

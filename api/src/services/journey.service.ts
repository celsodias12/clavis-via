import { and, eq, gte, lte } from 'drizzle-orm'
import type { Database } from '../@types/database.type'
import type { Achievement, JourneyOverview } from '../@types/journey.type'
import { ACHIEVEMENT_KINDS } from '../constants/journey.constant'
import {
  checkIns,
  dayCompletions,
  planDays,
  planEnrollments,
  practiceCompletions,
} from '../database/schema.database'
import type { ContentLanguage } from '../i18n/language'
import { addDays, weekDates } from '../utils/date'
import { findCurrentPlan } from './plan.service'

async function loadCheckInDates(
  database: Database,
  userId: string,
  upTo: string,
): Promise<string[]> {
  const rows = await database
    .selectDistinct({ localDate: checkIns.localDate })
    .from(checkIns)
    .where(and(eq(checkIns.userId, userId), lte(checkIns.localDate, upTo)))
  return rows.map((row) => row.localDate)
}

// Counts consecutive days with a check-in, starting today or, when today has none yet, yesterday.
function countStreak(checkInDates: Set<string>, localDate: string): number {
  let day = checkInDates.has(localDate) ? localDate : addDays(localDate, -1)
  let streak = 0
  while (checkInDates.has(day)) {
    streak += 1
    day = addDays(day, -1)
  }
  return streak
}

type CountedKind = Extract<Achievement, { count: number }>['kind']

function counted(kind: CountedKind, count: number): Achievement[] {
  return count >= 1 ? [{ kind, count }] : []
}

async function countCompletedPlans(
  database: Database,
  userId: string,
  completedPlanIds: string[],
): Promise<number> {
  const enrollments = await database
    .select({ planId: planEnrollments.planId })
    .from(planEnrollments)
    .where(eq(planEnrollments.userId, userId))
  const totals = await database.select({ planId: planDays.planId }).from(planDays)
  let completedPlans = 0
  for (const { planId } of enrollments) {
    const totalDays = totals.filter((day) => day.planId === planId).length
    const completedDays = completedPlanIds.filter((completedId) => completedId === planId).length
    if (completedDays >= totalDays) {
      completedPlans += 1
    }
  }
  return completedPlans
}

export async function getJourneyOverview(
  database: Database,
  userId: string,
  localDate: string,
  language: ContentLanguage = 'pt-BR',
): Promise<JourneyOverview> {
  const weekRange = weekDates(localDate)
  const [checkInDates, weekRows, completions, practiceRows, currentPlan] = await Promise.all([
    loadCheckInDates(database, userId, localDate),
    database
      .select({ localDate: checkIns.localDate })
      .from(checkIns)
      .where(
        and(
          eq(checkIns.userId, userId),
          gte(checkIns.localDate, weekRange[0]),
          lte(checkIns.localDate, weekRange.at(-1) as string),
        ),
      ),
    database
      .select({ planId: dayCompletions.planId })
      .from(dayCompletions)
      .where(eq(dayCompletions.userId, userId)),
    database
      .select({ id: practiceCompletions.id })
      .from(practiceCompletions)
      .where(eq(practiceCompletions.userId, userId)),
    findCurrentPlan(database, userId, language),
  ])
  const completedPlans = await countCompletedPlans(
    database,
    userId,
    completions.map((completion) => completion.planId),
  )
  const weekCheckInDates = new Set(weekRows.map((row) => row.localDate))

  const planProgress: Achievement[] =
    currentPlan && currentPlan.completedDays >= 1
      ? [
          {
            kind: ACHIEVEMENT_KINDS.PLAN_PROGRESS,
            planTitle: currentPlan.title,
            completedDays: currentPlan.completedDays,
            totalDays: currentPlan.totalDays,
          },
        ]
      : []
  // Counted achievements only show once their value reaches 1.
  const achievements: Achievement[] = [
    ...counted(ACHIEVEMENT_KINDS.WEEKLY_CHECK_INS, weekRows.length),
    ...planProgress,
    ...counted(ACHIEVEMENT_KINDS.COMPLETED_PLANS, completedPlans),
    ...counted(ACHIEVEMENT_KINDS.COMPLETED_PRACTICES, practiceRows.length),
    ...counted(ACHIEVEMENT_KINDS.COMPLETED_ACTIONS, completions.length),
  ]
  return {
    streakDays: countStreak(new Set(checkInDates), localDate),
    week: weekRange.map((date) => ({ localDate: date, hasCheckIn: weekCheckInDates.has(date) })),
    achievements,
  }
}

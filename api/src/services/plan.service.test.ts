import { reset } from 'cloudflare:test'
import { env } from 'cloudflare:workers'
import { TRPCError } from '@trpc/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyMigrations } from '../../tests/utils/apply-migrations'
import { createDatabase } from '../configs/d1.config'
import { PLAN_ERRORS } from '../constants/plan.constant'
import { TRPC_ERRORS } from '../constants/trpc.constant'
import { dayCompletions, planEnrollments } from '../database/schema.database'
import {
  completeDay,
  findCurrentPlan,
  findPlanDay,
  getPlanDetail,
  listPlans,
  startPlan,
} from './plan.service'

const USER_ID = 'user_1'
const OTHER_USER_ID = 'user_2'
const SHORT_PLAN_ID = 'when-discouragement-weighs'
const OTHER_PLAN_ID = 'after-a-rejection'

const database = createDatabase(env.DB)

beforeEach(async () => {
  await reset()
  await applyMigrations()
})

afterEach(() => {
  vi.useRealTimers()
})

// Pins the clock so enrollment and completion times are ordered deterministically.
function setClock(isoInstant: string) {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(isoInstant))
}

async function expectNotFound(promise: Promise<unknown>, message: string) {
  const error = await promise.then(
    () => null,
    (caught: unknown) => caught,
  )
  expect(error).toBeInstanceOf(TRPCError)
  expect(error).toMatchObject({ code: TRPC_ERRORS.NOT_FOUND, message })
}

describe('listPlans', () => {
  it('returns the five plans in position order', async () => {
    const plans = await listPlans(database)
    expect(plans.map((plan) => plan.id)).toEqual([
      SHORT_PLAN_ID,
      OTHER_PLAN_ID,
      'learning-to-set-boundaries',
      'when-your-faith-is-tired',
      'finding-direction-again',
    ])
    expect(plans[0]).toMatchObject({
      title: 'Quando o desânimo pesar',
      category: 'emotions',
      totalDays: 3,
    })
    expect(Object.keys(plans[0]).sort()).toEqual(['category', 'id', 'title', 'totalDays'])
  })
})

describe('getPlanDetail', () => {
  it('returns the days of a plan the user has not started', async () => {
    const detail = await getPlanDetail(database, USER_ID, SHORT_PLAN_ID)
    expect(detail.days.map((day) => day.title)).toEqual([
      'Respirar e reconhecer',
      'Pequenos movimentos',
      'Voltar a acreditar',
    ])
    expect(detail.days.map((day) => day.dayNumber)).toEqual([1, 2, 3])
    expect(detail).toMatchObject({
      isEnrolled: false,
      completedDayNumbers: [],
      reflections: [],
      totalDays: 3,
    })
    expect(detail.description.length).toBeGreaterThan(0)
  })

  it('answers NOT_FOUND for an unknown plan', async () => {
    await expectNotFound(getPlanDetail(database, USER_ID, 'nope'), PLAN_ERRORS.PLAN_NOT_FOUND)
  })

  it('lists reflections ordered by day number with the day title', async () => {
    await completeDay(database, USER_ID, {
      planId: SHORT_PLAN_ID,
      dayNumber: 2,
      reflection: 'Dois.',
    })
    await completeDay(database, USER_ID, {
      planId: SHORT_PLAN_ID,
      dayNumber: 1,
      reflection: 'Respirei.',
    })
    await completeDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber: 3, reflection: null })
    const detail = await getPlanDetail(database, USER_ID, SHORT_PLAN_ID)
    expect(detail.completedDayNumbers).toEqual([1, 2, 3])
    expect(detail.reflections.map((reflection) => reflection.dayNumber)).toEqual([1, 2])
    expect(detail.reflections[0]).toMatchObject({
      dayTitle: 'Respirar e reconhecer',
      text: 'Respirei.',
    })
    expect(new Date(detail.reflections[0].completedAt).toISOString()).toBe(
      detail.reflections[0].completedAt,
    )
  })
})

describe('findPlanDay', () => {
  it('returns the content of a day without completion', async () => {
    const day = await findPlanDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber: 1 })
    expect(day).toMatchObject({
      planId: SHORT_PLAN_ID,
      planTitle: 'Quando o desânimo pesar',
      totalDays: 3,
      dayNumber: 1,
      title: 'Respirar e reconhecer',
      videoDurationSeconds: 138,
      completion: null,
    })
    for (const key of ['message', 'reflection', 'action', 'tip', 'prayer'] as const) {
      expect(day[key].length).toBeGreaterThan(0)
    }
  })

  it('answers NOT_FOUND for a day beyond the plan', async () => {
    await expectNotFound(
      findPlanDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber: 4 }),
      PLAN_ERRORS.DAY_NOT_FOUND,
    )
  })

  it('shows the completion of the user only', async () => {
    await completeDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber: 1, reflection: 'Oi.' })
    const own = await findPlanDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber: 1 })
    expect(own.completion).toMatchObject({ reflection: 'Oi.' })
    const other = await findPlanDay(database, OTHER_USER_ID, {
      planId: SHORT_PLAN_ID,
      dayNumber: 1,
    })
    expect(other.completion).toBeNull()
  })
})

describe('startPlan', () => {
  it('is idempotent and keeps the first start date', async () => {
    setClock('2026-10-20T10:00:00Z')
    const first = await startPlan(database, USER_ID, SHORT_PLAN_ID)
    setClock('2026-10-20T11:00:00Z')
    const second = await startPlan(database, USER_ID, SHORT_PLAN_ID)
    expect(first).toEqual({ planId: SHORT_PLAN_ID, startedAt: '2026-10-20T10:00:00.000Z' })
    expect(second).toEqual(first)
  })

  it('creates one row under concurrent calls', async () => {
    const results = await Promise.all([
      startPlan(database, USER_ID, SHORT_PLAN_ID),
      startPlan(database, USER_ID, SHORT_PLAN_ID),
      startPlan(database, USER_ID, SHORT_PLAN_ID),
    ])
    expect(new Set(results.map((result) => result.startedAt)).size).toBe(1)
    expect(await database.select().from(planEnrollments)).toHaveLength(1)
  })

  it('answers NOT_FOUND for an unknown plan', async () => {
    await expectNotFound(startPlan(database, USER_ID, 'nope'), PLAN_ERRORS.PLAN_NOT_FOUND)
  })
})

describe('completeDay', () => {
  it('enrolls the user when needed', async () => {
    const completion = await completeDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber: 1 })
    expect(completion).toMatchObject({ planId: SHORT_PLAN_ID, dayNumber: 1, reflection: null })
    const detail = await getPlanDetail(database, USER_ID, SHORT_PLAN_ID)
    expect(detail.isEnrolled).toBe(true)
    expect(detail.completedDayNumbers).toEqual([1])
  })

  it('keeps the original enrollment date', async () => {
    setClock('2026-10-20T10:00:00Z')
    await startPlan(database, USER_ID, SHORT_PLAN_ID)
    setClock('2026-10-20T12:00:00Z')
    await completeDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber: 1 })
    const [enrollment] = await database.select().from(planEnrollments)
    expect(enrollment.startedAt.toISOString()).toBe('2026-10-20T10:00:00.000Z')
  })

  it('keeps the first reflection when completed twice', async () => {
    const first = await completeDay(database, USER_ID, {
      planId: SHORT_PLAN_ID,
      dayNumber: 1,
      reflection: 'Respirei.',
    })
    const second = await completeDay(database, USER_ID, {
      planId: SHORT_PLAN_ID,
      dayNumber: 1,
      reflection: 'Outra.',
    })
    expect(second).toEqual(first)
    expect(second.reflection).toBe('Respirei.')
  })

  it('creates one row under concurrent calls', async () => {
    const results = await Promise.all([
      completeDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber: 1, reflection: 'A' }),
      completeDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber: 1, reflection: 'B' }),
    ])
    expect(results[0]).toEqual(results[1])
    expect(await database.select().from(dayCompletions)).toHaveLength(1)
    expect(await database.select().from(planEnrollments)).toHaveLength(1)
  })

  it('stores a null reflection as null', async () => {
    const completion = await completeDay(database, USER_ID, {
      planId: SHORT_PLAN_ID,
      dayNumber: 1,
      reflection: null,
    })
    expect(completion.reflection).toBeNull()
  })

  it('answers NOT_FOUND for a missing day', async () => {
    await expectNotFound(
      completeDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber: 4 }),
      PLAN_ERRORS.DAY_NOT_FOUND,
    )
    expect(await database.select().from(planEnrollments)).toHaveLength(0)
  })
})

describe('findCurrentPlan', () => {
  it('is null for a new user', async () => {
    expect(await findCurrentPlan(database, USER_ID)).toBeNull()
  })

  it('follows the progress of a started plan', async () => {
    await startPlan(database, USER_ID, SHORT_PLAN_ID)
    expect(await findCurrentPlan(database, USER_ID)).toEqual({
      planId: SHORT_PLAN_ID,
      title: 'Quando o desânimo pesar',
      totalDays: 3,
      completedDays: 0,
      nextDayNumber: 1,
    })
    await completeDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber: 1 })
    expect(await findCurrentPlan(database, USER_ID)).toMatchObject({
      completedDays: 1,
      nextDayNumber: 2,
    })
  })

  it('points at the first day not completed', async () => {
    await completeDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber: 2 })
    expect(await findCurrentPlan(database, USER_ID)).toMatchObject({
      completedDays: 1,
      nextDayNumber: 1,
    })
  })

  it('returns the plan with the latest activity', async () => {
    setClock('2026-10-20T10:00:00Z')
    await startPlan(database, USER_ID, SHORT_PLAN_ID)
    setClock('2026-10-20T11:00:00Z')
    await startPlan(database, USER_ID, OTHER_PLAN_ID)
    expect((await findCurrentPlan(database, USER_ID))?.planId).toBe(OTHER_PLAN_ID)
    setClock('2026-10-20T12:00:00Z')
    await completeDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber: 1 })
    expect((await findCurrentPlan(database, USER_ID))?.planId).toBe(SHORT_PLAN_ID)
  })

  it('prefers the earlier plan when activity ties', async () => {
    setClock('2026-10-20T10:00:00Z')
    await startPlan(database, USER_ID, OTHER_PLAN_ID)
    await startPlan(database, USER_ID, SHORT_PLAN_ID)
    expect((await findCurrentPlan(database, USER_ID))?.planId).toBe(SHORT_PLAN_ID)
  })

  it('never treats a finished plan as current', async () => {
    setClock('2026-10-20T10:00:00Z')
    await startPlan(database, USER_ID, OTHER_PLAN_ID)
    setClock('2026-10-20T11:00:00Z')
    for (const dayNumber of [1, 2, 3]) {
      await completeDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber })
    }
    expect((await findCurrentPlan(database, USER_ID))?.planId).toBe(OTHER_PLAN_ID)
  })

  it('is null once the only plan is finished', async () => {
    for (const dayNumber of [1, 2, 3]) {
      await completeDay(database, USER_ID, { planId: SHORT_PLAN_ID, dayNumber })
    }
    expect(await findCurrentPlan(database, USER_ID)).toBeNull()
  })
})

describe('user isolation', () => {
  it('never shows the enrollment, completions or reflections of another user', async () => {
    await completeDay(database, USER_ID, {
      planId: SHORT_PLAN_ID,
      dayNumber: 1,
      reflection: 'Segredo.',
    })
    expect(await findCurrentPlan(database, OTHER_USER_ID)).toBeNull()
    const detail = await getPlanDetail(database, OTHER_USER_ID, SHORT_PLAN_ID)
    expect(detail).toMatchObject({ isEnrolled: false, completedDayNumbers: [], reflections: [] })
    const own = await getPlanDetail(database, USER_ID, SHORT_PLAN_ID)
    expect(own.reflections).toHaveLength(1)
  })
})

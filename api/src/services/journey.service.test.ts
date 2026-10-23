import { reset } from 'cloudflare:test'
import { env } from 'cloudflare:workers'
import { beforeEach, describe, expect, it } from 'vitest'
import { applyMigrations } from '../../tests/utils/apply-migrations'
import { createDatabase } from '../configs/d1.config'
import { checkIns } from '../database/schema.database'
import { getJourneyOverview } from './journey.service'
import { completeDay } from './plan.service'
import { completePractice } from './practice.service'

const USER_ID = 'user_1'
const OTHER_USER_ID = 'user_2'
const PLAN_ID = 'when-discouragement-weighs'
const TODAY = '2026-10-19'

const database = createDatabase(env.DB)

beforeEach(async () => {
  await reset()
  await applyMigrations()
})

let sequence = 0
async function addCheckIn(localDate: string, userId = USER_ID) {
  sequence += 1
  await database.insert(checkIns).values({
    id: `check-in-${sequence}`,
    userId,
    state: 'at-peace',
    otherText: null,
    localDate,
    createdAt: new Date(1_700_000_000_000 + sequence),
  })
}

describe('getJourneyOverview', () => {
  it('returns an empty overview for a new user', async () => {
    const overview = await getJourneyOverview(database, USER_ID, TODAY)
    expect(overview.streakDays).toBe(0)
    expect(overview.week).toHaveLength(7)
    expect(overview.week.map((day) => day.localDate)[0]).toBe('2026-10-19')
    expect(overview.week.every((day) => !day.hasCheckIn)).toBe(true)
    expect(overview.achievements).toEqual([])
  })

  it('counts a streak that includes today, with two check-ins on one day', async () => {
    await addCheckIn('2026-10-17')
    await addCheckIn('2026-10-18')
    await addCheckIn('2026-10-19')
    await addCheckIn('2026-10-19')
    const overview = await getJourneyOverview(database, USER_ID, TODAY)
    expect(overview.streakDays).toBe(3)
    expect(overview.week[0]).toEqual({ localDate: '2026-10-19', hasCheckIn: true })
    expect(overview.week[1]).toEqual({ localDate: '2026-10-20', hasCheckIn: false })
  })

  it('keeps the streak from yesterday when today has no check-in yet', async () => {
    await addCheckIn('2026-10-17')
    await addCheckIn('2026-10-18')
    await addCheckIn('2026-10-19')
    const overview = await getJourneyOverview(database, USER_ID, '2026-10-20')
    expect(overview.streakDays).toBe(3)
  })

  it('breaks the streak at a gap', async () => {
    await addCheckIn('2026-10-17')
    await addCheckIn('2026-10-19')
    expect((await getJourneyOverview(database, USER_ID, '2026-10-19')).streakDays).toBe(1)
    expect((await getJourneyOverview(database, USER_ID, '2026-10-20')).streakDays).toBe(1)
    expect((await getJourneyOverview(database, USER_ID, '2026-10-21')).streakDays).toBe(0)
  })

  it('ignores check-ins after the given date for the streak', async () => {
    await addCheckIn('2026-10-19')
    await addCheckIn('2026-10-20')
    expect((await getJourneyOverview(database, USER_ID, '2026-10-19')).streakDays).toBe(1)
  })

  it('counts weekly check-ins as rows and shows plan progress and actions', async () => {
    await addCheckIn('2026-10-19')
    await addCheckIn('2026-10-19')
    await addCheckIn('2026-10-18')
    await completeDay(database, USER_ID, { planId: PLAN_ID, dayNumber: 1 })
    const overview = await getJourneyOverview(database, USER_ID, TODAY)
    expect(overview.achievements).toEqual([
      { kind: 'weekly-check-ins', count: 2 },
      {
        kind: 'plan-progress',
        planTitle: 'Quando o desânimo pesar',
        completedDays: 1,
        totalDays: 3,
      },
      { kind: 'completed-actions', count: 1 },
    ])
  })

  it('shows a completed plan instead of its progress', async () => {
    for (const dayNumber of [1, 2, 3]) {
      await completeDay(database, USER_ID, { planId: PLAN_ID, dayNumber })
    }
    const overview = await getJourneyOverview(database, USER_ID, TODAY)
    expect(overview.achievements).toEqual([
      { kind: 'completed-plans', count: 1 },
      { kind: 'completed-actions', count: 3 },
    ])
  })

  it('counts every practice completion', async () => {
    await completePractice(database, USER_ID, { practiceId: 'guided-breathing', localDate: TODAY })
    await completePractice(database, USER_ID, { practiceId: 'guided-breathing', localDate: TODAY })
    const overview = await getJourneyOverview(database, USER_ID, TODAY)
    expect(overview.achievements).toEqual([{ kind: 'completed-practices', count: 2 }])
  })

  it('never counts another user rows', async () => {
    await addCheckIn('2026-10-19', OTHER_USER_ID)
    await completeDay(database, OTHER_USER_ID, { planId: PLAN_ID, dayNumber: 1 })
    await completePractice(database, OTHER_USER_ID, {
      practiceId: 'guided-breathing',
      localDate: TODAY,
    })
    const overview = await getJourneyOverview(database, USER_ID, TODAY)
    expect(overview.streakDays).toBe(0)
    expect(overview.week.every((day) => !day.hasCheckIn)).toBe(true)
    expect(overview.achievements).toEqual([])
  })
})

import { reset } from 'cloudflare:test'
import { env } from 'cloudflare:workers'
import { beforeEach, describe, expect, it } from 'vitest'
import { applyMigrations } from '../../tests/utils/apply-migrations'
import type { CheckInState } from '../@types/check-in.type'
import { createDatabase } from '../configs/d1.config'
import { checkIns } from '../database/schema.database'
import { getEmotionSummary } from './emotion.service'
import { completePractice } from './practice.service'

const USER_ID = 'user_1'
const OTHER_USER_ID = 'user_2'
const WEEK_ANCHOR = '2026-10-21'

const database = createDatabase(env.DB)

beforeEach(async () => {
  await reset()
  await applyMigrations()
})

let sequence = 0
async function addCheckIn(localDate: string, state: CheckInState, userId = USER_ID) {
  sequence += 1
  await database.insert(checkIns).values({
    id: `check-in-${sequence}`,
    userId,
    state,
    otherText: state === 'other' ? 'texto' : null,
    localDate,
    createdAt: new Date(1_700_000_000_000 + sequence),
  })
}

function summary(period: 'week' | 'month' | 'year', localDate = WEEK_ANCHOR, userId = USER_ID) {
  return getEmotionSummary(database, userId, { period, localDate })
}

describe('hasCheckIns', () => {
  it('is false for a period without check-ins', async () => {
    expect((await summary('week')).hasCheckIns).toBe(false)
  })

  it('is true when the period holds only an "Outro" check-in, which has no score', async () => {
    await addCheckIn('2026-03-10', 'other')
    const year = await summary('year')
    expect(year.hasCheckIns).toBe(true)
    expect(year.points.every((point) => point.score === null)).toBe(true)
    expect((await summary('week')).hasCheckIns).toBe(false)
  })

  it('only looks at the requested period and at the person', async () => {
    await addCheckIn('2026-10-12', 'anxious')
    await addCheckIn('2026-10-21', 'anxious', OTHER_USER_ID)
    expect((await summary('week')).hasCheckIns).toBe(false)
    expect((await summary('month')).hasCheckIns).toBe(true)
  })
})

describe('points', () => {
  it('builds 7 weekly points where the latest check-in of the day wins', async () => {
    await addCheckIn('2026-10-19', 'anxious')
    await addCheckIn('2026-10-19', 'at-peace')
    await addCheckIn('2026-10-20', 'other')
    const { points, period } = await summary('week')
    expect(period).toBe('week')
    expect(points).toHaveLength(7)
    expect(points[0]).toEqual({ key: '2026-10-19', score: 5, state: 'at-peace' })
    expect(points[1]).toEqual({ key: '2026-10-20', score: null, state: 'other' })
    expect(points[2]).toEqual({ key: '2026-10-21', score: null, state: null })
    expect(points[6].key).toBe('2026-10-25')
  })

  it('gives every state its score', async () => {
    const scores: [CheckInState, number][] = [
      ['heavy', 1],
      ['discouraged', 1],
      ['anxious', 2],
      ['irritated', 2],
      ['sensitive', 3],
      ['hopeful', 4],
      ['at-peace', 5],
    ]
    for (const [index, [state]] of scores.entries()) {
      await addCheckIn(`2026-10-${19 + index}`, state)
    }
    const { points } = await summary('week')
    expect(points.map((point) => point.score)).toEqual(scores.map(([, score]) => score))
  })

  it('builds one point per day of the month', async () => {
    const { points } = await summary('month', '2027-02-10')
    expect(points).toHaveLength(28)
    expect(points[0].key).toBe('2027-02-01')
    expect(points[27].key).toBe('2027-02-28')
  })

  it('builds 12 yearly points with the monthly average of the daily scores', async () => {
    await addCheckIn('2026-03-01', 'anxious')
    await addCheckIn('2026-03-02', 'at-peace')
    await addCheckIn('2026-03-03', 'other')
    await addCheckIn('2026-04-01', 'sensitive')
    const { points } = await summary('year', '2026-10-21')
    expect(points).toHaveLength(12)
    expect(points[0]).toEqual({ key: '2026-01', score: null, state: null })
    expect(points[2]).toEqual({ key: '2026-03', score: 3.5, state: null })
    expect(points[3].score).toBe(3)
  })

  it('never includes another user rows', async () => {
    await addCheckIn('2026-10-19', 'at-peace', OTHER_USER_ID)
    const { points, insights } = await summary('week')
    expect(points.every((point) => point.state === null)).toBe(true)
    expect(insights).toEqual([])
  })
})

describe('balanced-days insight', () => {
  it('appears when balanced days outnumber difficult days', async () => {
    await addCheckIn('2026-10-19', 'at-peace')
    await addCheckIn('2026-10-20', 'at-peace')
    await addCheckIn('2026-10-21', 'anxious')
    expect((await summary('week')).insights).toContainEqual({ kind: 'balanced-days' })
  })

  it('is absent on a tie', async () => {
    await addCheckIn('2026-10-19', 'at-peace')
    await addCheckIn('2026-10-20', 'anxious')
    expect((await summary('week')).insights).not.toContainEqual({ kind: 'balanced-days' })
  })

  it('is absent without balanced days', async () => {
    expect((await summary('week')).insights).toEqual([])
  })
})

describe('less-anxiety insight', () => {
  it('reports the drop against the previous week', async () => {
    await addCheckIn('2026-10-12', 'anxious')
    await addCheckIn('2026-10-13', 'anxious')
    await addCheckIn('2026-10-19', 'anxious')
    expect((await summary('week')).insights).toContainEqual({ kind: 'less-anxiety', percent: 50 })
  })

  it('compares with the previous month and the previous year', async () => {
    await addCheckIn('2026-09-10', 'anxious')
    await addCheckIn('2026-09-11', 'anxious')
    await addCheckIn('2026-09-12', 'anxious')
    expect((await summary('month', '2026-10-05')).insights).toContainEqual({
      kind: 'less-anxiety',
      percent: 100,
    })
    expect((await summary('year', '2027-05-05')).insights).toContainEqual({
      kind: 'less-anxiety',
      percent: 100,
    })
  })

  it('crosses the year boundary for the previous month', async () => {
    await addCheckIn('2025-12-10', 'anxious')
    expect((await summary('month', '2026-01-05')).insights).toContainEqual({
      kind: 'less-anxiety',
      percent: 100,
    })
  })

  it('is absent when the previous period had no anxious day', async () => {
    await addCheckIn('2026-10-19', 'anxious')
    const { insights } = await summary('week')
    expect(insights).toEqual([])
    expect(JSON.stringify(insights)).not.toMatch(/NaN|Infinity|null/)
  })

  it('is absent when anxiety did not drop', async () => {
    await addCheckIn('2026-10-12', 'anxious')
    await addCheckIn('2026-10-19', 'anxious')
    expect((await summary('week')).insights).toEqual([])
  })
})

describe('routine-helps insight', () => {
  it('appears when days with practice score higher than days without', async () => {
    await addCheckIn('2026-10-19', 'at-peace')
    await addCheckIn('2026-10-20', 'anxious')
    await completePractice(database, USER_ID, {
      practiceId: 'guided-breathing',
      localDate: '2026-10-19',
    })
    await completePractice(database, USER_ID, {
      practiceId: 'guided-breathing',
      localDate: '2026-10-19',
    })
    expect((await summary('week')).insights).toContainEqual({ kind: 'routine-helps' })
  })

  it('is absent when every scored day has a practice', async () => {
    await addCheckIn('2026-10-19', 'at-peace')
    await completePractice(database, USER_ID, {
      practiceId: 'guided-breathing',
      localDate: '2026-10-19',
    })
    expect((await summary('week')).insights).toEqual([{ kind: 'balanced-days' }])
  })

  it('is absent when days with practice do not score higher', async () => {
    await addCheckIn('2026-10-19', 'anxious')
    await addCheckIn('2026-10-20', 'at-peace')
    await completePractice(database, USER_ID, {
      practiceId: 'guided-breathing',
      localDate: '2026-10-19',
    })
    expect((await summary('week')).insights).not.toContainEqual({ kind: 'routine-helps' })
  })

  it('ignores practices of other users and unscored days', async () => {
    await addCheckIn('2026-10-19', 'at-peace')
    await addCheckIn('2026-10-20', 'other')
    await completePractice(database, OTHER_USER_ID, {
      practiceId: 'guided-breathing',
      localDate: '2026-10-19',
    })
    expect((await summary('week')).insights).not.toContainEqual({ kind: 'routine-helps' })
  })
})

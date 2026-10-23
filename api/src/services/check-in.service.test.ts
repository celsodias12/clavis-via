import { reset } from 'cloudflare:test'
import { env } from 'cloudflare:workers'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applyMigrations } from '../../tests/utils/apply-migrations'
import { createDatabase } from '../configs/d1.config'
import { CHECK_IN_STATES } from '../constants/check-in.constant'
import { createCheckIn, findLatestCheckInForDate } from './check-in.service'

const USER_ID = 'user_1'
const OTHER_USER_ID = 'user_2'
const LOCAL_DATE = '2026-10-19'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

const database = createDatabase(env.DB)

beforeEach(async () => {
  await reset()
  await applyMigrations()
})

describe('createCheckIn', () => {
  it('returns the stored row with an ISO creation date', async () => {
    const checkIn = await createCheckIn(database, USER_ID, {
      state: 'anxious',
      localDate: LOCAL_DATE,
    })
    expect(checkIn.id).toMatch(UUID_PATTERN)
    expect(checkIn).toMatchObject({ state: 'anxious', otherText: null, localDate: LOCAL_DATE })
    expect(new Date(checkIn.createdAt).toISOString()).toBe(checkIn.createdAt)
  })

  it('keeps the text of the other state', async () => {
    const checkIn = await createCheckIn(database, USER_ID, {
      state: 'other',
      otherText: 'cansada',
      localDate: LOCAL_DATE,
    })
    expect(checkIn.otherText).toBe('cansada')
  })
})

describe('findLatestCheckInForDate', () => {
  it('returns the last check-in even when both share the same millisecond', async () => {
    // Freeze the clock so both rows get the very same created_at.
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      await createCheckIn(database, USER_ID, { state: 'heavy', localDate: LOCAL_DATE })
      await createCheckIn(database, USER_ID, { state: 'hopeful', localDate: LOCAL_DATE })
    } finally {
      vi.useRealTimers()
    }
    const latest = await findLatestCheckInForDate(database, USER_ID, LOCAL_DATE)
    expect(latest?.state).toBe('hopeful')
  })

  it('returns null for another date', async () => {
    await createCheckIn(database, USER_ID, { state: 'heavy', localDate: LOCAL_DATE })
    expect(await findLatestCheckInForDate(database, USER_ID, '2026-10-20')).toBeNull()
  })

  it('never returns the check-in of another user', async () => {
    await createCheckIn(database, OTHER_USER_ID, { state: 'heavy', localDate: LOCAL_DATE })
    expect(await findLatestCheckInForDate(database, USER_ID, LOCAL_DATE)).toBeNull()
  })

  it('returns a daily key with a practice for every state', async () => {
    const practiceIds = new Set<string>()
    const titles = new Set<string>()
    for (const state of Object.values(CHECK_IN_STATES)) {
      await createCheckIn(database, USER_ID, {
        state,
        otherText: state === CHECK_IN_STATES.OTHER ? 'texto' : undefined,
        localDate: LOCAL_DATE,
      })
      const found = await findLatestCheckInForDate(database, USER_ID, LOCAL_DATE)
      expect(found?.dailyKey.title.length).toBeLessThanOrEqual(22)
      expect(found?.dailyKey.text.length).toBeLessThanOrEqual(110)
      expect(found?.dailyKey.practice.durationSeconds).toBeGreaterThanOrEqual(120)
      expect(found?.dailyKey.practice.durationSeconds).toBeLessThanOrEqual(300)
      practiceIds.add(found?.dailyKey.practice.id ?? '')
      titles.add(found?.dailyKey.title ?? '')
    }
    expect(practiceIds.size).toBe(8)
    expect(titles.size).toBe(8)
  })

  it('returns the content of the anxious state', async () => {
    await createCheckIn(database, USER_ID, { state: 'anxious', localDate: LOCAL_DATE })
    const found = await findLatestCheckInForDate(database, USER_ID, LOCAL_DATE)
    expect(found?.dailyKey.title).toBe('Voz e Limites')
    expect(found?.dailyKey.practice).toMatchObject({ id: 'guided-breathing', durationSeconds: 180 })
  })
})

import { reset } from 'cloudflare:test'
import { env } from 'cloudflare:workers'
import { beforeEach, describe, expect, it } from 'vitest'
import { applyMigrations } from '../../tests/utils/apply-migrations'
import { createDatabase } from '../configs/d1.config'
import { dailyKeys, planDays, plans, practices, verses } from '../database/schema.database'
import { createCheckIn, findLatestCheckInForDate } from '../services/check-in.service'
import { findPlanDay, getPlanDetail, listPlans } from '../services/plan.service'
import { findVerseOfDay } from '../services/verse.service'
import {
  conversationCopy,
  dailyKeyCopy,
  dayCopy,
  planCopy,
  practiceCopy,
  verseCopy,
} from './content'

const database = createDatabase(env.DB)

beforeEach(async () => {
  await reset()
  await applyMigrations()
})

describe('localized seeded content', () => {
  it('rejects missing translations with the affected content key', () => {
    expect(() => practiceCopy('missing', 'en')).toThrow(
      'Missing localized content: practice/en/missing',
    )
    expect(() => dailyKeyCopy('missing', 'en')).toThrow(
      'Missing localized content: daily-key/en/missing',
    )
    expect(() => planCopy('missing', 'es')).toThrow('Missing localized content: plan/es/missing')
    expect(() => dayCopy('missing', 1, 'en')).toThrow('Missing localized content: day/en/missing/1')
    expect(() => dayCopy('when-discouragement-weighs', 99, 'es')).toThrow(
      'Missing localized content: day/es/when-discouragement-weighs/99',
    )
    expect(() => verseCopy(999, 'es')).toThrow('Missing localized content: verse/es/999')
  })

  it.each(['en', 'es'] as const)('covers every seeded record and field in %s', async (language) => {
    const [practiceRows, keyRows, planRows, dayRows, verseRows] = await Promise.all([
      database.select().from(practices),
      database.select().from(dailyKeys),
      database.select().from(plans),
      database.select().from(planDays),
      database.select().from(verses),
    ])

    for (const row of practiceRows) {
      expect(Object.values(practiceCopy(row.id, language) ?? {}).every(Boolean)).toBe(true)
    }
    for (const row of keyRows) {
      expect(Object.values(dailyKeyCopy(row.state, language) ?? {}).every(Boolean)).toBe(true)
    }
    for (const row of planRows) {
      expect(Object.values(planCopy(row.id, language) ?? {}).every(Boolean)).toBe(true)
    }
    for (const row of dayRows) {
      expect(Object.values(dayCopy(row.planId, row.dayNumber, language) ?? {}).every(Boolean)).toBe(
        true,
      )
    }
    for (const row of verseRows) {
      expect(Object.values(verseCopy(row.position, language) ?? {}).every(Boolean)).toBe(true)
    }
    expect(conversationCopy(language)?.defaults).toHaveLength(5)
  })

  it('uses English throughout a check-in, plan and verse response', async () => {
    await createCheckIn(database, 'user_1', { state: 'anxious', localDate: '2026-10-19' })

    const checkIn = await findLatestCheckInForDate(database, 'user_1', '2026-10-19', 'en')
    const catalog = await listPlans(database, 'en')
    const detail = await getPlanDetail(database, 'user_1', 'when-discouragement-weighs', 'en')
    const day = await findPlanDay(
      database,
      'user_1',
      { planId: 'when-discouragement-weighs', dayNumber: 1 },
      'en',
    )
    const verse = await findVerseOfDay(database, '1970-01-01', 'en')

    expect(checkIn?.dailyKey).toMatchObject({
      title: 'Voice and boundaries',
      practice: { title: 'Guided breathing' },
    })
    expect(catalog[0].title).toBe('When discouragement weighs on you')
    expect(detail.days[0].title).toBe('Breathe and acknowledge')
    expect(day.planTitle).toBe(catalog[0].title)
    expect(day.message).toContain('Before asking yourself to be strong')
    expect(verse.reference).toBe('Jeremiah 29:11')
  })

  it('uses Spanish throughout the same content', async () => {
    await createCheckIn(database, 'user_1', { state: 'anxious', localDate: '2026-10-19' })
    const checkIn = await findLatestCheckInForDate(database, 'user_1', '2026-10-19', 'es')
    const detail = await getPlanDetail(database, 'user_1', 'when-discouragement-weighs', 'es')
    const day = await findPlanDay(
      database,
      'user_1',
      { planId: 'when-discouragement-weighs', dayNumber: 1 },
      'es',
    )
    const verse = await findVerseOfDay(database, '1970-01-01', 'es')

    expect(checkIn?.dailyKey).toMatchObject({
      title: 'Voz y límites',
      practice: { title: 'Respiración guiada' },
    })
    expect(detail.title).toBe('Cuando pesa el desánimo')
    expect(day.action).toContain('Respira hondo cinco veces')
    expect(verse.reference).toBe('Jeremías 29:11')
  })
})

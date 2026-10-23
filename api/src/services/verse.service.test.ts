import { reset } from 'cloudflare:test'
import { env } from 'cloudflare:workers'
import { beforeEach, describe, expect, it } from 'vitest'
import { applyMigrations } from '../../tests/utils/apply-migrations'
import { createDatabase } from '../configs/d1.config'
import { verses } from '../database/schema.database'
import { addDays } from '../utils/date'
import { findVerseOfDay } from './verse.service'

const VERSE_COUNT = 14

const database = createDatabase(env.DB)

beforeEach(async () => {
  await reset()
  await applyMigrations()
})

describe('findVerseOfDay', () => {
  it('returns the same verse for the same date', async () => {
    const first = await findVerseOfDay(database, '2026-10-19')
    const second = await findVerseOfDay(database, '2026-10-19')
    expect(first).toEqual(second)
    expect(Object.keys(first).sort()).toEqual(['reference', 'text'])
  })

  it('returns consecutive positions on consecutive dates, wrapping at the total', async () => {
    const rows = await database.select().from(verses)
    const byPosition = new Map(rows.map((row) => [row.position, row]))
    expect(byPosition.size).toBe(VERSE_COUNT)
    const start = '2026-10-19'
    const startPosition = (Date.parse(`${start}T00:00:00Z`) / 86_400_000) % VERSE_COUNT
    for (let offset = 0; offset <= VERSE_COUNT; offset += 1) {
      const verse = await findVerseOfDay(database, addDays(start, offset))
      const expected = byPosition.get((startPosition + offset) % VERSE_COUNT)
      expect(verse).toEqual({ text: expected?.text, reference: expected?.reference })
    }
  })
})

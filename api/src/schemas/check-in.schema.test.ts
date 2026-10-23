import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCheckInInputSchema, latestForDateInputSchema } from './check-in.schema'

const LOCAL_DATE = '2026-10-19'

afterEach(() => {
  vi.useRealTimers()
})

// Pins the server clock; the schema reads it at parse time.
function freezeClock(isoInstant: string) {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(isoInstant))
}

describe('createCheckInInputSchema', () => {
  beforeEach(() => {
    freezeClock('2026-10-19T12:00:00Z')
  })

  it('accepts a state without text', () => {
    expect(
      createCheckInInputSchema.safeParse({ state: 'anxious', localDate: LOCAL_DATE }).success,
    ).toBe(true)
  })

  it('requires text for the other state', () => {
    expect(
      createCheckInInputSchema.safeParse({ state: 'other', localDate: LOCAL_DATE }).success,
    ).toBe(false)
  })

  it('rejects whitespace-only text', () => {
    const input = { state: 'other', otherText: '   ', localDate: LOCAL_DATE }
    expect(createCheckInInputSchema.safeParse(input).success).toBe(false)
  })

  it('rejects text above the maximum length', () => {
    const input = { state: 'other', otherText: 'a'.repeat(281), localDate: LOCAL_DATE }
    expect(createCheckInInputSchema.safeParse(input).success).toBe(false)
  })

  it('accepts text at the maximum length', () => {
    const input = { state: 'other', otherText: 'a'.repeat(280), localDate: LOCAL_DATE }
    expect(createCheckInInputSchema.safeParse(input).success).toBe(true)
  })

  it('rejects text with any state other than other', () => {
    const input = { state: 'anxious', otherText: 'x', localDate: LOCAL_DATE }
    expect(createCheckInInputSchema.safeParse(input).success).toBe(false)
  })

  it('rejects an invalid date', () => {
    expect(
      createCheckInInputSchema.safeParse({ state: 'anxious', localDate: '2026-13-01' }).success,
    ).toBe(false)
  })

  it('rejects an unknown state', () => {
    expect(
      createCheckInInputSchema.safeParse({ state: 'bored', localDate: LOCAL_DATE }).success,
    ).toBe(false)
  })

  it('rejects unknown keys', () => {
    const input = { state: 'anxious', localDate: LOCAL_DATE, extra: 1 }
    expect(createCheckInInputSchema.safeParse(input).success).toBe(false)
  })

  it('trims the text', () => {
    const parsed = createCheckInInputSchema.parse({
      state: 'other',
      otherText: '  cansada  ',
      localDate: LOCAL_DATE,
    })
    expect(parsed.otherText).toBe('cansada')
  })
})

describe('local date window', () => {
  const instant = '2026-10-19T12:00:00Z'

  it.each(['2026-10-18', '2026-10-19', '2026-10-20'])('accepts %s', (localDate) => {
    freezeClock(instant)
    expect(latestForDateInputSchema.safeParse({ localDate }).success).toBe(true)
    expect(createCheckInInputSchema.safeParse({ state: 'anxious', localDate }).success).toBe(true)
  })

  it.each(['2026-10-17', '2026-10-21', '2020-01-01', '2099-01-01'])('rejects %s', (localDate) => {
    freezeClock(instant)
    expect(latestForDateInputSchema.safeParse({ localDate }).success).toBe(false)
    expect(createCheckInInputSchema.safeParse({ state: 'anxious', localDate }).success).toBe(false)
  })

  it('follows the server clock across the UTC midnight', () => {
    freezeClock('2026-10-19T23:59:59Z')
    expect(latestForDateInputSchema.safeParse({ localDate: '2026-10-20' }).success).toBe(true)
    expect(latestForDateInputSchema.safeParse({ localDate: '2026-10-21' }).success).toBe(false)
    freezeClock('2026-10-20T00:00:00Z')
    expect(latestForDateInputSchema.safeParse({ localDate: '2026-10-21' }).success).toBe(true)
  })
})

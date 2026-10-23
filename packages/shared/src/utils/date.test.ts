import { describe, expect, it } from 'vite-plus/test'
import { greetingPeriod, millisecondsUntilNextBoundary, toLocalDate } from './date'

describe('toLocalDate', () => {
  it('uses the device time zone (America/Sao_Paulo in the test setup)', () => {
    // 23:30 local time on the 19th is already the 20th in UTC.
    expect(toLocalDate(new Date('2026-10-20T02:30:00Z'))).toBe('2026-10-19')
    expect(toLocalDate(new Date('2026-10-20T03:00:00Z'))).toBe('2026-10-20')
  })

  it('pads month and day with zeros', () => {
    expect(toLocalDate(new Date('2026-03-05T15:00:00Z'))).toBe('2026-03-05')
  })
})

describe('greetingPeriod', () => {
  it.each([
    [4, 59, 'evening'],
    [5, 0, 'morning'],
    [11, 59, 'morning'],
    [12, 0, 'afternoon'],
    [17, 59, 'afternoon'],
    [18, 0, 'evening'],
    [0, 0, 'evening'],
    [23, 59, 'evening'],
  ])('maps %i:%i to %s', (hours, minutes, expected) => {
    expect(greetingPeriod(new Date(2026, 9, 19, hours, minutes))).toBe(expected)
  })
})

describe('millisecondsUntilNextBoundary', () => {
  const MINUTE = 60_000

  it.each([
    [2, 0, 3 * 60 * MINUTE],
    [5, 0, 7 * 60 * MINUTE],
    [11, 59, MINUTE],
    [12, 0, 6 * 60 * MINUTE],
    [17, 30, 30 * MINUTE],
    [18, 0, 6 * 60 * MINUTE],
    [23, 59, MINUTE],
    [0, 0, 5 * 60 * MINUTE],
  ])('waits from %i:%i until the next date or greeting change', (hours, minutes, expected) => {
    expect(millisecondsUntilNextBoundary(new Date(2026, 9, 19, hours, minutes))).toBe(expected)
  })
})

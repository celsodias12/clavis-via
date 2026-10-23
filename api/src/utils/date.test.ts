import { describe, expect, it } from 'vitest'
import {
  addDays,
  daysSinceEpoch,
  isPlausibleLocalDate,
  monthDates,
  monthStart,
  weekDates,
  yearEnd,
  yearMonths,
  yearStart,
} from './date'

describe('isPlausibleLocalDate', () => {
  it('accepts the UTC date and one day around it, and rejects further dates', () => {
    const now = new Date('2026-10-20T12:00:00Z')
    expect(isPlausibleLocalDate('2026-10-19', now)).toBe(true)
    expect(isPlausibleLocalDate('2026-10-21', now)).toBe(true)
    expect(isPlausibleLocalDate('2026-10-22', now)).toBe(false)
  })
})

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
  })
})

describe('daysSinceEpoch', () => {
  it('counts whole days from 1970-01-01', () => {
    expect(daysSinceEpoch('1970-01-01')).toBe(0)
    expect(daysSinceEpoch('1970-01-11')).toBe(10)
  })
})

describe('weekDates', () => {
  it('starts on Monday and ends on Sunday', () => {
    expect(weekDates('2026-10-19')[0]).toBe('2026-10-19')
    expect(weekDates('2026-10-19')[6]).toBe('2026-10-25')
    expect(weekDates('2026-10-22')).toEqual(weekDates('2026-10-19'))
  })

  it('keeps Sunday in the week that started the previous Monday', () => {
    expect(weekDates('2026-10-25')).toEqual(weekDates('2026-10-19'))
  })

  it('crosses month and year boundaries', () => {
    expect(weekDates('2026-12-31')).toEqual([
      '2026-12-28',
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
      '2027-01-03',
    ])
  })
})

describe('monthDates', () => {
  it('returns every day of the month', () => {
    expect(monthDates('2027-02-10')).toHaveLength(28)
    expect(monthDates('2028-02-10')).toHaveLength(29)
    expect(monthDates('2026-04-30')).toHaveLength(30)
    const october = monthDates('2026-10-20')
    expect(october).toHaveLength(31)
    expect(october[0]).toBe('2026-10-01')
    expect(october[30]).toBe('2026-10-31')
  })
})

describe('year helpers', () => {
  it('returns the bounds and the twelve month keys', () => {
    expect(monthStart('2026-10-20')).toBe('2026-10-01')
    expect(yearStart('2026-10-20')).toBe('2026-01-01')
    expect(yearEnd('2026-10-20')).toBe('2026-12-31')
    const months = yearMonths('2026-10-20')
    expect(months).toHaveLength(12)
    expect(months[0]).toBe('2026-01')
    expect(months[11]).toBe('2026-12')
  })
})

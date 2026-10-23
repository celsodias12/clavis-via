import { LOCAL_DATE_WINDOW } from '../constants/check-in.constant'
import { CALENDAR } from '../constants/date.constant'

function shiftDays(date: Date, days: number): string {
  return new Date(date.getTime() + days * LOCAL_DATE_WINDOW.MILLISECONDS_PER_DAY)
    .toISOString()
    .slice(0, LOCAL_DATE_WINDOW.ISO_DATE_LENGTH)
}

// Device time zones span UTC-12 to UTC+14, so a legitimate local date is the UTC date +/- 1 day.
export function isPlausibleLocalDate(localDate: string, now: Date): boolean {
  return (
    localDate >= shiftDays(now, -LOCAL_DATE_WINDOW.TOLERANCE_DAYS) &&
    localDate <= shiftDays(now, LOCAL_DATE_WINDOW.TOLERANCE_DAYS)
  )
}

// All calendar helpers below are pure UTC arithmetic over yyyy-MM-dd strings, so they never depend
// on the server time zone.
function toUtcMilliseconds(localDate: string): number {
  return Date.parse(`${localDate}${CALENDAR.MIDNIGHT_UTC_SUFFIX}`)
}

export function addDays(localDate: string, days: number): string {
  return shiftDays(new Date(toUtcMilliseconds(localDate)), days)
}

export function daysSinceEpoch(localDate: string): number {
  return toUtcMilliseconds(localDate) / LOCAL_DATE_WINDOW.MILLISECONDS_PER_DAY
}

// Weeks run Monday to Sunday.
export function weekDates(localDate: string): string[] {
  const weekday = new Date(toUtcMilliseconds(localDate)).getUTCDay()
  const monday = addDays(localDate, -((weekday + CALENDAR.MONDAY_OFFSET) % CALENDAR.DAYS_PER_WEEK))
  return Array.from({ length: CALENDAR.DAYS_PER_WEEK }, (_, offset) => addDays(monday, offset))
}

export function monthStart(localDate: string): string {
  return `${localDate.slice(0, CALENDAR.MONTH_KEY_LENGTH)}${CALENDAR.FIRST_DAY_SUFFIX}`
}

export function monthDates(localDate: string): string[] {
  const first = monthStart(localDate)
  const firstDate = new Date(toUtcMilliseconds(first))
  // Day 0 of the next month is the last day of this one.
  const length = new Date(
    Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth() + 1, 0),
  ).getUTCDate()
  return Array.from({ length }, (_, offset) => addDays(first, offset))
}

export function yearStart(localDate: string): string {
  return `${localDate.slice(0, CALENDAR.YEAR_LENGTH)}-01-01`
}

export function yearEnd(localDate: string): string {
  return `${localDate.slice(0, CALENDAR.YEAR_LENGTH)}-12-31`
}

// The 12 yyyy-MM keys of the year of the given date.
export function yearMonths(localDate: string): string[] {
  const year = localDate.slice(0, CALENDAR.YEAR_LENGTH)
  return Array.from(
    { length: CALENDAR.MONTHS_PER_YEAR },
    (_, offset) =>
      `${year}-${String(offset + 1).padStart(CALENDAR.DATE_PAD_LENGTH, CALENDAR.PAD_CHARACTER)}`,
  )
}

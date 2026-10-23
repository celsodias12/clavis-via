import { format } from 'date-fns'
import type { GreetingPeriod } from '../@types/greeting.type'
import { CLOCK_BOUNDARY_HOURS, DATE_FORMATS } from '../constants/date.constant'
import { GREETING_PERIODS, GREETING_START_HOURS } from '../constants/greeting.constant'

// Calendar date in the device time zone, the day a check-in belongs to (e.g. 23:30 on the 19th stays the 19th).
export function toLocalDate(date: Date): string {
  return format(date, DATE_FORMATS.LOCAL_DATE)
}

// Period of the day for the greeting, from the device clock: 5:00-11:59, 12:00-17:59 and 18:00-4:59.
export function greetingPeriod(date: Date): GreetingPeriod {
  const hours = date.getHours()
  if (hours >= GREETING_START_HOURS.EVENING || hours < GREETING_START_HOURS.MORNING) {
    return GREETING_PERIODS.EVENING
  }
  return hours >= GREETING_START_HOURS.AFTERNOON
    ? GREETING_PERIODS.AFTERNOON
    : GREETING_PERIODS.MORNING
}

// Milliseconds from `date` until the next device-time moment at which the local date or the greeting changes.
export function millisecondsUntilNextBoundary(date: Date): number {
  const waits = CLOCK_BOUNDARY_HOURS.map(
    (hour) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour).getTime() -
      date.getTime(),
  ).filter((wait) => wait > 0)
  return Math.min(...waits)
}

import { GREETING_START_HOURS } from './greeting.constant'

// date-fns format patterns.
export const DATE_FORMATS = Object.freeze({
  LOCAL_DATE: 'yyyy-MM-dd',
  CLOCK_TIME: 'HH:mm',
})

// Hours (device time) at which "today" or the greeting period can change, in ascending order:
// midnight, then the start of each greeting period; 24 stands for the next midnight.
export const CLOCK_BOUNDARY_HOURS = Object.freeze([
  0,
  GREETING_START_HOURS.MORNING,
  GREETING_START_HOURS.AFTERNOON,
  GREETING_START_HOURS.EVENING,
  24,
])

// Intl options of the day a reflection was written on (e.g. "20 de outubro").
export const REFLECTION_DATE_OPTIONS = Object.freeze({
  day: 'numeric',
  month: 'long',
} satisfies Intl.DateTimeFormatOptions)

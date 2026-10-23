import type { GreetingPeriod } from '../@types/greeting.type'
import type { TranslationKeys } from '../i18n/types'

export const GREETING_PERIODS = Object.freeze({
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
})

// First hour (device time, 24 h clock) of each period; the evening runs from 18:00 until 4:59.
export const GREETING_START_HOURS = Object.freeze({
  MORNING: 5,
  AFTERNOON: 12,
  EVENING: 18,
})

// Translation keys per period: with the first name, and without it (no comma).
export const GREETING_KEYS = Object.freeze({
  [GREETING_PERIODS.MORNING]: Object.freeze({
    named: 'screen.home.greeting.morning',
    anonymous: 'screen.home.greeting.morningAnonymous',
  }),
  [GREETING_PERIODS.AFTERNOON]: Object.freeze({
    named: 'screen.home.greeting.afternoon',
    anonymous: 'screen.home.greeting.afternoonAnonymous',
  }),
  [GREETING_PERIODS.EVENING]: Object.freeze({
    named: 'screen.home.greeting.evening',
    anonymous: 'screen.home.greeting.eveningAnonymous',
  }),
} satisfies Record<
  GreetingPeriod,
  Readonly<{ named: TranslationKeys; anonymous: TranslationKeys }>
>)

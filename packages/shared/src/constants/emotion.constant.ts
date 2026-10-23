import type { EmotionInsightCopy, EmotionInsightKind, EmotionPeriod } from '../@types/emotion.type'
import type { TranslationKeys } from '../i18n/types'

export const EMOTION_PERIODS = Object.freeze({
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
} satisfies Record<string, EmotionPeriod>)

// The segments of the screen, in the order of the design.
export const EMOTION_PERIOD_SEGMENTS = Object.freeze([
  { key: EMOTION_PERIODS.WEEK, labelKey: 'screen.emotions.periods.week' },
  { key: EMOTION_PERIODS.MONTH, labelKey: 'screen.emotions.periods.month' },
  { key: EMOTION_PERIODS.YEAR, labelKey: 'screen.emotions.periods.year' },
] satisfies readonly { key: EmotionPeriod; labelKey: TranslationKeys }[])

export const EMOTION_INSIGHT_KINDS = Object.freeze({
  BALANCED_DAYS: 'balanced-days',
  LESS_ANXIETY: 'less-anxiety',
  ROUTINE_HELPS: 'routine-helps',
} satisfies Record<string, EmotionInsightKind>)

export const EMOTION_INSIGHT_COPY: Readonly<Record<EmotionInsightKind, EmotionInsightCopy>> =
  Object.freeze({
    [EMOTION_INSIGHT_KINDS.BALANCED_DAYS]: {
      titleKey: 'screen.emotions.insights.balancedDays.title',
      textKeys: {
        [EMOTION_PERIODS.WEEK]: 'screen.emotions.insights.balancedDays.text.week',
        [EMOTION_PERIODS.MONTH]: 'screen.emotions.insights.balancedDays.text.month',
        [EMOTION_PERIODS.YEAR]: 'screen.emotions.insights.balancedDays.text.year',
      },
    },
    [EMOTION_INSIGHT_KINDS.LESS_ANXIETY]: {
      titleKey: 'screen.emotions.insights.lessAnxiety.title',
      textKeys: {
        [EMOTION_PERIODS.WEEK]: 'screen.emotions.insights.lessAnxiety.text.week',
        [EMOTION_PERIODS.MONTH]: 'screen.emotions.insights.lessAnxiety.text.month',
        [EMOTION_PERIODS.YEAR]: 'screen.emotions.insights.lessAnxiety.text.year',
      },
    },
    [EMOTION_INSIGHT_KINDS.ROUTINE_HELPS]: {
      titleKey: 'screen.emotions.insights.routineHelps.title',
      textKeys: {
        [EMOTION_PERIODS.WEEK]: 'screen.emotions.insights.routineHelps.text',
        [EMOTION_PERIODS.MONTH]: 'screen.emotions.insights.routineHelps.text',
        [EMOTION_PERIODS.YEAR]: 'screen.emotions.insights.routineHelps.text',
      },
    },
  })

// The week the API sends runs Monday to Sunday.
export const WEEKDAY_LABEL_KEYS: readonly TranslationKeys[] = Object.freeze([
  'screen.emotions.weekdays.monday',
  'screen.emotions.weekdays.tuesday',
  'screen.emotions.weekdays.wednesday',
  'screen.emotions.weekdays.thursday',
  'screen.emotions.weekdays.friday',
  'screen.emotions.weekdays.saturday',
  'screen.emotions.weekdays.sunday',
])

export const MONTH_INITIAL_KEYS: readonly TranslationKeys[] = Object.freeze([
  'screen.emotions.monthInitials.january',
  'screen.emotions.monthInitials.february',
  'screen.emotions.monthInitials.march',
  'screen.emotions.monthInitials.april',
  'screen.emotions.monthInitials.may',
  'screen.emotions.monthInitials.june',
  'screen.emotions.monthInitials.july',
  'screen.emotions.monthInitials.august',
  'screen.emotions.monthInitials.september',
  'screen.emotions.monthInitials.october',
  'screen.emotions.monthInitials.november',
  'screen.emotions.monthInitials.december',
])

// The month view labels the days 1, 8, 15, 22 and 29: every seventh day from the first.
export const EMOTION_MONTH_LABEL = Object.freeze({
  DAY_STEP: 7,
  FIRST_DAY: 1,
})

// Positions of the day (YYYY-MM-DD) and of the month (YYYY-MM) inside a point key.
export const EMOTION_POINT_KEY = Object.freeze({
  DAY_START: 8,
  MONTH_START: 5,
  MONTH_END: 7,
})

// Scores run from 1 (heavy) to 5 (at peace).
export const EMOTION_SCORE_RANGE = Object.freeze({
  MINIMUM: 1,
  MAXIMUM: 5,
})

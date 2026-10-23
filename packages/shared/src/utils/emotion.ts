import type {
  EmotionChartPoint,
  EmotionInsight,
  EmotionPeriod,
  EmotionPoint,
} from '../@types/emotion.type'
import { CHECK_IN_OPTION_BY_STATE } from '../constants/check-in.constant'
import {
  EMOTION_INSIGHT_KINDS,
  EMOTION_MONTH_LABEL,
  EMOTION_PERIODS,
  EMOTION_POINT_KEY,
  MONTH_INITIAL_KEYS,
  WEEKDAY_LABEL_KEYS,
} from '../constants/emotion.constant'
import type { TranslationKeys } from '../i18n/types'

// The text under a column of the chart: the weekday (week), the initial of the month (year) or the day of the
// month for days 1, 8, 15, 22 and 29 (month, the other columns have none).
export function emotionColumnLabel(
  period: EmotionPeriod,
  point: EmotionPoint,
  index: number,
  translate: (key: TranslationKeys) => string,
): string | null {
  if (period === EMOTION_PERIODS.WEEK) {
    return translate(WEEKDAY_LABEL_KEYS[index])
  }
  if (period === EMOTION_PERIODS.YEAR) {
    const month = Number(
      point.key.slice(EMOTION_POINT_KEY.MONTH_START, EMOTION_POINT_KEY.MONTH_END),
    )
    return translate(MONTH_INITIAL_KEYS[month - 1])
  }
  const day = Number(point.key.slice(EMOTION_POINT_KEY.DAY_START))
  return (day - EMOTION_MONTH_LABEL.FIRST_DAY) % EMOTION_MONTH_LABEL.DAY_STEP === 0
    ? String(day)
    : null
}

// One chart column per point, in order; a column without a score keeps its place.
export function toEmotionChartPoints(points: readonly EmotionPoint[]): EmotionChartPoint[] {
  return points.map((point, index) => ({ position: index, score: point.score }))
}

// The interpolation values of the text of an insight: only "less anxiety" carries a percentage.
export function insightTextOptions(insight: EmotionInsight): { percent?: number } {
  return insight.kind === EMOTION_INSIGHT_KINDS.LESS_ANXIETY ? { percent: insight.percent } : {}
}

// The spoken description of one day of the week chart ("Seg: Ansiosa", or that the day has no check-in).
export function emotionDayLabel(
  point: EmotionPoint,
  dayLabel: string | null,
  translate: (key: TranslationKeys, options?: Record<string, string | null>) => string,
): string {
  if (point.state === null) {
    return translate('screen.emotions.dayWithoutCheckIn', { day: dayLabel })
  }
  return translate('screen.emotions.dayLabel', {
    day: dayLabel,
    state: translate(CHECK_IN_OPTION_BY_STATE[point.state].labelKey),
  })
}

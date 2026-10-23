import type { AppRouter } from '@clavis-via/api/router'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { TranslationKeys } from '../i18n/types'

export type EmotionPeriod = inferRouterInputs<AppRouter>['emotion']['summary']['period']
export type EmotionSummary = inferRouterOutputs<AppRouter>['emotion']['summary']
export type EmotionPoint = EmotionSummary['points'][number]
export type EmotionInsight = EmotionSummary['insights'][number]
export type EmotionInsightKind = EmotionInsight['kind']

// The copy of one insight: its title and the text of each period (a text may be the same for every period).
export type EmotionInsightCopy = Readonly<{
  titleKey: TranslationKeys
  textKeys: Readonly<Record<EmotionPeriod, TranslationKeys>>
}>

// One column of the chart: its position in the period (0-based) and its score, null when there is none.
export type EmotionChartPoint = Readonly<{ position: number; score: number | null }>

import type { z } from 'zod'
import type { EMOTION_PERIODS } from '../constants/emotion.constant'
import type { emotionSummaryInputSchema } from '../schemas/emotion.schema'
import type { CheckInState } from './check-in.type'

export type EmotionPeriod = (typeof EMOTION_PERIODS)[keyof typeof EMOTION_PERIODS]

export type EmotionPoint = {
  key: string
  score: number | null
  state: CheckInState | null
}

export type EmotionInsight =
  | { kind: 'balanced-days' }
  | { kind: 'less-anxiety'; percent: number }
  | { kind: 'routine-helps' }

export type EmotionSummary = {
  period: EmotionPeriod
  points: EmotionPoint[]
  // True when the period holds at least one check-in, even one without a score ("Outro").
  hasCheckIns: boolean
  insights: EmotionInsight[]
}

export type EmotionSummaryInput = z.infer<typeof emotionSummaryInputSchema>

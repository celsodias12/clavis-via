import type { CheckInState } from '../@types/check-in.type'
import { CHECK_IN_STATES } from './check-in.constant'

export const EMOTION_PERIODS = Object.freeze({
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
})

// The "other" state has no score on purpose: free text cannot be placed on the scale.
export const EMOTION_SCORES: Readonly<Partial<Record<CheckInState, number>>> = Object.freeze({
  [CHECK_IN_STATES.HEAVY]: 1,
  [CHECK_IN_STATES.DISCOURAGED]: 1,
  [CHECK_IN_STATES.ANXIOUS]: 2,
  [CHECK_IN_STATES.IRRITATED]: 2,
  [CHECK_IN_STATES.SENSITIVE]: 3,
  [CHECK_IN_STATES.HOPEFUL]: 4,
  [CHECK_IN_STATES.AT_PEACE]: 5,
})

export const BALANCED_STATES: readonly CheckInState[] = Object.freeze([
  CHECK_IN_STATES.AT_PEACE,
  CHECK_IN_STATES.HOPEFUL,
])

export const DIFFICULT_STATES: readonly CheckInState[] = Object.freeze([
  CHECK_IN_STATES.HEAVY,
  CHECK_IN_STATES.ANXIOUS,
  CHECK_IN_STATES.DISCOURAGED,
  CHECK_IN_STATES.IRRITATED,
])

export const EMOTION_INSIGHT_KINDS = Object.freeze({
  BALANCED_DAYS: 'balanced-days',
  LESS_ANXIETY: 'less-anxiety',
  ROUTINE_HELPS: 'routine-helps',
})

export const EMOTION_SCORE_DECIMALS_FACTOR = 10
export const PERCENT_FACTOR = 100

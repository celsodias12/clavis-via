import type { GREETING_PERIODS } from '../constants/greeting.constant'

export type GreetingPeriod = (typeof GREETING_PERIODS)[keyof typeof GREETING_PERIODS]

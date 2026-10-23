import type { z } from 'zod'
import type { CHECK_IN_STATES } from '../constants/check-in.constant'
import type { createCheckInInputSchema } from '../schemas/check-in.schema'

export type CheckInState = (typeof CHECK_IN_STATES)[keyof typeof CHECK_IN_STATES]

// createdAt is an ISO 8601 string because the wire format has no Date support.
export type CheckIn = {
  id: string
  state: CheckInState
  otherText: string | null
  localDate: string
  createdAt: string
}

export type Practice = {
  id: string
  title: string
  durationSeconds: number
  description: string
}

export type DailyKey = {
  title: string
  text: string
  practice: Practice
}

export type CheckInWithDailyKey = CheckIn & { dailyKey: DailyKey }

export type CreateCheckInInput = z.infer<typeof createCheckInInputSchema>

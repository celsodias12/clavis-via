import type { z } from 'zod'
import type { PLAN_CATEGORIES } from '../constants/plan.constant'
import type {
  completeDayInputSchema,
  dayInputSchema,
  planInputSchema,
} from '../schemas/plan.schema'

export type PlanCategory = (typeof PLAN_CATEGORIES)[keyof typeof PLAN_CATEGORIES]

export type PlanSummary = {
  id: string
  title: string
  category: PlanCategory
  totalDays: number
}

export type PlanDaySummary = {
  dayNumber: number
  title: string
  summary: string
}

export type PlanReflection = {
  dayNumber: number
  dayTitle: string
  text: string
  completedAt: string
}

export type PlanDetail = PlanSummary & {
  description: string
  isEnrolled: boolean
  completedDayNumbers: number[]
  days: PlanDaySummary[]
  reflections: PlanReflection[]
}

export type PlanDay = {
  planId: string
  planTitle: string
  totalDays: number
  dayNumber: number
  title: string
  videoDurationSeconds: number
  message: string
  reflection: string
  action: string
  tip: string
  prayer: string
  completion: { reflection: string | null; completedAt: string } | null
}

export type PlanEnrollment = {
  planId: string
  startedAt: string
}

export type DayCompletion = {
  planId: string
  dayNumber: number
  reflection: string | null
  completedAt: string
}

export type CurrentPlan = {
  planId: string
  title: string
  totalDays: number
  completedDays: number
  nextDayNumber: number
}

export type PlanInput = z.infer<typeof planInputSchema>
export type DayInput = z.infer<typeof dayInputSchema>
export type CompleteDayInput = z.infer<typeof completeDayInputSchema>

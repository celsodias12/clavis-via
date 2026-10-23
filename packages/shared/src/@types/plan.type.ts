import type { AppRouter } from '@clavis-via/api/router'
import type { inferRouterOutputs } from '@trpc/server'
import type { z } from 'zod'
import type {
  PLAN_CATEGORY_FILTER_KEYS,
  PLAN_DAY_SEGMENT_KEYS,
  PLAN_TAB_KEYS,
} from '../constants/plan.constant'
import type { TranslationKeys } from '../i18n/types'
import type { dayActionFormSchema } from '../validation/plan.schema'

export type PlanSummary = inferRouterOutputs<AppRouter>['plan']['list'][number]
export type PlanDetail = inferRouterOutputs<AppRouter>['plan']['detail']
export type PlanDay = inferRouterOutputs<AppRouter>['plan']['day']
export type PlanDaySummary = PlanDetail['days'][number]
export type PlanReflection = PlanDetail['reflections'][number]
export type PlanCategory = PlanSummary['category']

export type PlanCategoryFilterKey =
  (typeof PLAN_CATEGORY_FILTER_KEYS)[keyof typeof PLAN_CATEGORY_FILTER_KEYS]

export type PlanCategoryFilter = Readonly<{
  key: PlanCategoryFilterKey
  labelKey: TranslationKeys
}>

export type PlanTabKey = (typeof PLAN_TAB_KEYS)[keyof typeof PLAN_TAB_KEYS]

export type PlanDaySegmentKey = (typeof PLAN_DAY_SEGMENT_KEYS)[keyof typeof PLAN_DAY_SEGMENT_KEYS]

export type PlanDaySegment = Readonly<{
  key: PlanDaySegmentKey
  labelKey: TranslationKeys
}>

export type PlanTab = Readonly<{
  key: PlanTabKey
  labelKey: TranslationKeys
}>

export type FilterChipOption = Readonly<{
  key: string
  label: string
}>

export type DayActionFormInput = z.input<typeof dayActionFormSchema>
export type DayActionFormValues = z.output<typeof dayActionFormSchema>

export type CurrentPlan = NonNullable<inferRouterOutputs<AppRouter>['plan']['current']>

export type PlanImageNames = Readonly<{
  thumbnail: string
  cover: string
}>

// What the button of the Plano screen does, derived from the plan: its label, the day it opens and whether
// pressing it enrolls the person first.
export type PlanPrimaryAction = Readonly<{
  labelKey: TranslationKeys
  targetDayNumber: number
  needsEnrollment: boolean
  isDisabled: boolean
}>

// The icons of the meta row of the Plano screen.
export type PlanMetaIconName = 'calendar' | 'clock'

// What the platform gives the day action form: the toast for a completed day and what to do next (leave the
// screen).
export type DayActionFormOptions = Readonly<{
  planId: string
  dayNumber: number
  showToast: (message: string) => unknown
  onCompleted: () => unknown
}>

import type {
  PlanDetail,
  PlanImageNames,
  PlanPrimaryAction,
  PlanSummary,
} from '../@types/plan.type'
import {
  FIRST_DAY_NUMBER,
  PLAN_CATEGORY_FILTER_KEYS,
  PLAN_IMAGE_NAMES,
} from '../constants/plan.constant'

// A day number of a route is valid when it is a positive integer.
export function isValidDayNumber(dayNumber: number): boolean {
  return Number.isInteger(dayNumber) && dayNumber > 0
}

// The plans of a category chip (its key); "all" keeps every plan.
export function filterPlansByCategory(
  plans: readonly PlanSummary[],
  filterKey: string,
): readonly PlanSummary[] {
  if (filterKey === PLAN_CATEGORY_FILTER_KEYS.ALL) {
    return plans
  }
  return plans.filter((plan) => plan.category === filterKey)
}

// Starting enrolls first and then opens the first day; continuing opens the first day left to do; once every
// day is done the button only reports the plan as completed.
export function primaryActionForPlan(plan: PlanDetail): PlanPrimaryAction {
  const completedDayNumbers = new Set(plan.completedDayNumbers)
  const firstOpenDay = plan.days.find((day) => !completedDayNumbers.has(day.dayNumber))
  const targetDayNumber = firstOpenDay?.dayNumber ?? FIRST_DAY_NUMBER

  if (!plan.isEnrolled) {
    return {
      labelKey: 'screen.plan.start',
      targetDayNumber,
      needsEnrollment: true,
      isDisabled: false,
    }
  }
  if (firstOpenDay === undefined) {
    return {
      labelKey: 'screen.plan.completed',
      targetDayNumber,
      needsEnrollment: false,
      isDisabled: true,
    }
  }
  return {
    labelKey: 'screen.plan.continue',
    targetDayNumber,
    needsEnrollment: false,
    isDisabled: false,
  }
}

// The image names of a plan, or null for an id without images (the screens then use the neutral fallback).
export function planImageNames(planId: string): PlanImageNames | null {
  return Object.hasOwn(PLAN_IMAGE_NAMES, planId) ? PLAN_IMAGE_NAMES[planId] : null
}

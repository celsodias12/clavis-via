import { describe, expect, it } from 'vite-plus/test'
import type { PlanDetail, PlanSummary } from '../@types/plan.type'
import { PLAN_CATEGORY_FILTER_KEYS } from '../constants/plan.constant'
import {
  filterPlansByCategory,
  isValidDayNumber,
  planImageNames,
  primaryActionForPlan,
} from './plan'

function plan(overrides: Partial<PlanDetail> = {}): PlanDetail {
  return {
    id: 'plan-1',
    title: 'Plano',
    category: 'emotions',
    totalDays: 3,
    description: 'x',
    isEnrolled: false,
    completedDayNumbers: [],
    days: [
      { dayNumber: 1, title: 'a', summary: 'a' },
      { dayNumber: 2, title: 'b', summary: 'b' },
      { dayNumber: 3, title: 'c', summary: 'c' },
    ],
    reflections: [],
    ...overrides,
  } as PlanDetail
}

describe('isValidDayNumber', () => {
  it('accepts only positive integers', () => {
    expect(isValidDayNumber(1)).toBe(true)
    expect(isValidDayNumber(0)).toBe(false)
    expect(isValidDayNumber(-2)).toBe(false)
    expect(isValidDayNumber(1.5)).toBe(false)
    expect(isValidDayNumber(Number.NaN)).toBe(false)
  })
})

describe('filterPlansByCategory', () => {
  const plans = [
    { id: 'a', category: 'emotions' },
    { id: 'b', category: 'faith' },
  ] as PlanSummary[]

  it('keeps every plan for "all"', () => {
    expect(filterPlansByCategory(plans, PLAN_CATEGORY_FILTER_KEYS.ALL)).toBe(plans)
  })

  it('keeps only the plans of the category', () => {
    expect(filterPlansByCategory(plans, PLAN_CATEGORY_FILTER_KEYS.FAITH)).toEqual([plans[1]])
    expect(filterPlansByCategory(plans, PLAN_CATEGORY_FILTER_KEYS.RELATIONSHIPS)).toEqual([])
  })
})

describe('primaryActionForPlan', () => {
  it('starts a plan the person is not enrolled in and opens its first day', () => {
    expect(primaryActionForPlan(plan())).toEqual({
      labelKey: 'screen.plan.start',
      targetDayNumber: 1,
      needsEnrollment: true,
      isDisabled: false,
    })
  })

  it('continues on the first day that is not done', () => {
    expect(primaryActionForPlan(plan({ isEnrolled: true, completedDayNumbers: [1] }))).toEqual({
      labelKey: 'screen.plan.continue',
      targetDayNumber: 2,
      needsEnrollment: false,
      isDisabled: false,
    })
  })

  it('is disabled once every day is done', () => {
    expect(
      primaryActionForPlan(plan({ isEnrolled: true, completedDayNumbers: [1, 2, 3] })),
    ).toEqual({
      labelKey: 'screen.plan.completed',
      targetDayNumber: 1,
      needsEnrollment: false,
      isDisabled: true,
    })
  })
})

describe('planImageNames', () => {
  it('has a thumbnail and a cover for a demo plan', () => {
    expect(planImageNames('after-a-rejection')).toEqual({
      thumbnail: 'plan-thumbnail-after-a-rejection',
      cover: 'plan-cover-after-a-rejection',
    })
  })

  it('has nothing for an unknown id or an inherited object key', () => {
    expect(planImageNames('unknown-plan')).toBeNull()
    expect(planImageNames('constructor')).toBeNull()
  })
})

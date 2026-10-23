export const PLAN_CATEGORIES = Object.freeze({
  EMOTIONS: 'emotions',
  RELATIONSHIPS: 'relationships',
  FAITH: 'faith',
})

export const PLAN_LIMITS = Object.freeze({
  PLAN_ID_MAXIMUM_LENGTH: 64,
  DAY_NUMBER_MINIMUM: 1,
  DAY_NUMBER_MAXIMUM: 30,
  REFLECTION_MAXIMUM_LENGTH: 1000,
})

export const PLAN_ID_PATTERN = /^[a-z0-9-]+$/

export const PLAN_ERRORS = Object.freeze({
  PLAN_NOT_FOUND: 'plan_not_found',
  DAY_NOT_FOUND: 'day_not_found',
})

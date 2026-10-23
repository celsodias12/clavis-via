import { z } from 'zod'
import { PLAN_ID_PATTERN, PLAN_LIMITS } from '../constants/plan.constant'

export const planIdSchema = z
  .string()
  .min(1)
  .max(PLAN_LIMITS.PLAN_ID_MAXIMUM_LENGTH)
  .regex(PLAN_ID_PATTERN)

export const dayNumberSchema = z
  .number()
  .int()
  .min(PLAN_LIMITS.DAY_NUMBER_MINIMUM)
  .max(PLAN_LIMITS.DAY_NUMBER_MAXIMUM)

// A blank reflection is stored as null.
const reflectionSchema = z
  .string()
  .trim()
  .max(PLAN_LIMITS.REFLECTION_MAXIMUM_LENGTH)
  .transform((text) => (text === '' ? null : text))

export const planInputSchema = z.object({ planId: planIdSchema }).strict()

export const dayInputSchema = z
  .object({ planId: planIdSchema, dayNumber: dayNumberSchema })
  .strict()

export const completeDayInputSchema = z
  .object({
    planId: planIdSchema,
    dayNumber: dayNumberSchema,
    reflection: reflectionSchema.optional(),
  })
  .strict()

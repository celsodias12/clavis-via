import { z } from 'zod'
import { PRACTICE_ID_PATTERN, PRACTICE_LIMITS } from '../constants/practice.constant'
import { localDateSchema } from './local-date.schema'

const practiceIdSchema = z
  .string()
  .min(1)
  .max(PRACTICE_LIMITS.PRACTICE_ID_MAXIMUM_LENGTH)
  .regex(PRACTICE_ID_PATTERN)

export const practiceInputSchema = z.object({ practiceId: practiceIdSchema }).strict()

export const completePracticeInputSchema = z
  .object({ practiceId: practiceIdSchema, localDate: localDateSchema })
  .strict()

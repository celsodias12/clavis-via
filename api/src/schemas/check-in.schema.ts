import { z } from 'zod'
import type { CheckInState } from '../@types/check-in.type'
import {
  CHECK_IN_ISSUES,
  CHECK_IN_OTHER_TEXT_MAXIMUM_LENGTH,
  CHECK_IN_STATES,
} from '../constants/check-in.constant'
import { localDateSchema } from './local-date.schema'

const stateSchema = z.enum(Object.values(CHECK_IN_STATES) as [CheckInState, ...CheckInState[]])

export const createCheckInInputSchema = z
  .object({
    state: stateSchema,
    otherText: z.string().trim().min(1).max(CHECK_IN_OTHER_TEXT_MAXIMUM_LENGTH).optional(),
    localDate: localDateSchema,
  })
  .strict()
  .superRefine((input, context) => {
    const isOther = input.state === CHECK_IN_STATES.OTHER
    if (isOther && input.otherText === undefined) {
      context.addIssue({
        code: 'custom',
        path: ['otherText'],
        message: CHECK_IN_ISSUES.OTHER_TEXT_REQUIRED,
      })
    }
    if (!isOther && input.otherText !== undefined) {
      context.addIssue({
        code: 'custom',
        path: ['otherText'],
        message: CHECK_IN_ISSUES.OTHER_TEXT_NOT_ALLOWED,
      })
    }
  })

export const latestForDateInputSchema = z.object({ localDate: localDateSchema }).strict()

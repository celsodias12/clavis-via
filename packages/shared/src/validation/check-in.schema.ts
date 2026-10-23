import { z } from 'zod'
import type { CheckInState } from '../@types/check-in.type'
import {
  CHECK_IN_OTHER_TEXT_MAXIMUM_LENGTH,
  CHECK_IN_STATES,
  CHECK_IN_VALIDATION_MESSAGE_KEYS,
} from '../constants/check-in.constant'

const stateValues = Object.values(CHECK_IN_STATES) as [CheckInState, ...CheckInState[]]

// The text is only required (and only sent) for "Outro"; the API enforces the same rule.
export const checkInFormSchema = z
  .object({
    state: z.enum(stateValues, { error: CHECK_IN_VALIDATION_MESSAGE_KEYS.STATE_REQUIRED }),
    otherText: z.string().trim().max(CHECK_IN_OTHER_TEXT_MAXIMUM_LENGTH),
  })
  .superRefine((values, context) => {
    if (values.state === CHECK_IN_STATES.OTHER && values.otherText === '') {
      context.addIssue({
        code: 'custom',
        path: ['otherText'],
        message: CHECK_IN_VALIDATION_MESSAGE_KEYS.OTHER_TEXT_REQUIRED,
      })
    }
  })

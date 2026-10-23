import { z } from 'zod'
import {
  DAY_ACTION_REFLECTION_MAXIMUM_LENGTH,
  DAY_ACTION_VALIDATION_MESSAGE_KEYS,
} from '../constants/plan.constant'

// The reflection is optional: an empty text is fine. Surrounding spaces are dropped before the length is checked.
export const dayActionFormSchema = z.object({
  reflection: z.string().trim().max(DAY_ACTION_REFLECTION_MAXIMUM_LENGTH, {
    error: DAY_ACTION_VALIDATION_MESSAGE_KEYS.REFLECTION_TOO_LONG,
  }),
})

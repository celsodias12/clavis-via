import { z } from 'zod'
import {
  AUTHENTICATION_LIMITS,
  VALIDATION_MESSAGE_KEYS,
} from '../constants/authentication.constant'

// Messages are translation keys; the screens translate them when they render the field error.
const emailAddressSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: VALIDATION_MESSAGE_KEYS.EMAIL_INVALID }))

export const signUpFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { error: VALIDATION_MESSAGE_KEYS.FIRST_NAME_REQUIRED })
    .max(AUTHENTICATION_LIMITS.FIRST_NAME_MAXIMUM_LENGTH, {
      error: VALIDATION_MESSAGE_KEYS.FIRST_NAME_TOO_LONG,
    }),
  emailAddress: emailAddressSchema,
  password: z
    .string()
    .min(AUTHENTICATION_LIMITS.PASSWORD_MINIMUM_LENGTH, {
      error: VALIDATION_MESSAGE_KEYS.PASSWORD_TOO_SHORT,
    })
    .max(AUTHENTICATION_LIMITS.PASSWORD_MAXIMUM_LENGTH, {
      error: VALIDATION_MESSAGE_KEYS.PASSWORD_TOO_LONG,
    }),
})

export const signInFormSchema = z.object({
  emailAddress: emailAddressSchema,
  password: z.string().min(1, { error: VALIDATION_MESSAGE_KEYS.PASSWORD_REQUIRED }),
})

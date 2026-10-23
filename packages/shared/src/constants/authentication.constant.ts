import type { SignUpFormInput } from '../@types/authentication.type'
import type { TranslationKeys } from '../i18n/types'

// Translation keys used as zod messages; the screens translate them when rendering the field error.
export const VALIDATION_MESSAGE_KEYS = Object.freeze({
  FIRST_NAME_REQUIRED: 'screen.authentication.errors.firstNameRequired',
  FIRST_NAME_TOO_LONG: 'screen.authentication.errors.firstNameTooLong',
  EMAIL_INVALID: 'screen.authentication.errors.emailInvalid',
  PASSWORD_TOO_SHORT: 'screen.authentication.errors.passwordTooShort',
  PASSWORD_TOO_LONG: 'screen.authentication.errors.passwordTooLong',
  PASSWORD_REQUIRED: 'screen.authentication.errors.passwordRequired',
} satisfies Record<string, TranslationKeys>)

export const AUTHENTICATION_LIMITS = Object.freeze({
  FIRST_NAME_MAXIMUM_LENGTH: 64,
  PASSWORD_MINIMUM_LENGTH: 8,
  PASSWORD_MAXIMUM_LENGTH: 72,
})

// Form fields that Clerk can report an error for after a sign-up request.
export const SIGN_UP_FIELDS: readonly (keyof SignUpFormInput)[] = Object.freeze([
  'firstName',
  'emailAddress',
  'password',
])

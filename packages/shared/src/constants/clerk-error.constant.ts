import type { TranslationKeys } from '../i18n/types'

// Error codes returned by the Clerk Frontend API that the app handles on its own.
export const CLERK_ERROR_CODES = Object.freeze({
  IDENTIFIER_EXISTS: 'form_identifier_exists',
  PASSWORD_PWNED: 'form_password_pwned',
  PASSWORD_COMPROMISED: 'form_password_compromised',
  PASSWORD_TOO_SHORT: 'form_password_length_too_short',
  INVALID_EMAIL: 'form_param_format_invalid',
  IDENTIFIER_NOT_FOUND: 'form_identifier_not_found',
  PASSWORD_INCORRECT: 'form_password_incorrect',
  TOO_MANY_REQUESTS: 'too_many_requests',
})

export const CLERK_GENERIC_ERROR_KEY: TranslationKeys = 'screen.authentication.errors.generic'

// Sign in treats "no such account" and "wrong password" the same so the screen never reveals which one failed.
export const CLERK_ERROR_TRANSLATION_KEYS: Readonly<Record<string, TranslationKeys>> =
  Object.freeze({
    [CLERK_ERROR_CODES.IDENTIFIER_EXISTS]: 'screen.authentication.errors.emailInUse',
    [CLERK_ERROR_CODES.PASSWORD_PWNED]: 'screen.authentication.errors.passwordCompromised',
    [CLERK_ERROR_CODES.PASSWORD_COMPROMISED]: 'screen.authentication.errors.passwordCompromised',
    [CLERK_ERROR_CODES.PASSWORD_TOO_SHORT]: 'screen.authentication.errors.passwordTooShort',
    [CLERK_ERROR_CODES.INVALID_EMAIL]: 'screen.authentication.errors.emailInvalid',
    [CLERK_ERROR_CODES.IDENTIFIER_NOT_FOUND]: 'screen.authentication.errors.invalidCredentials',
    [CLERK_ERROR_CODES.PASSWORD_INCORRECT]: 'screen.authentication.errors.invalidCredentials',
    [CLERK_ERROR_CODES.TOO_MANY_REQUESTS]: 'screen.authentication.errors.tooManyRequests',
  })

// Statuses of a Clerk sign-up / sign-in attempt that the screens branch on.
export const CLERK_ATTEMPT_STATUS = Object.freeze({
  COMPLETE: 'complete',
})

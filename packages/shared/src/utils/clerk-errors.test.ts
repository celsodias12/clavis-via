import { describe, expect, it } from 'vite-plus/test'
import { CLERK_ERROR_CODES } from '../constants/clerk-error.constant'
import { translationKeyForClerkError } from './clerk-errors'

describe('translationKeyForClerkError', () => {
  it.each([
    [CLERK_ERROR_CODES.IDENTIFIER_EXISTS, 'screen.authentication.errors.emailInUse'],
    [CLERK_ERROR_CODES.PASSWORD_PWNED, 'screen.authentication.errors.passwordCompromised'],
    [CLERK_ERROR_CODES.PASSWORD_COMPROMISED, 'screen.authentication.errors.passwordCompromised'],
    [CLERK_ERROR_CODES.PASSWORD_TOO_SHORT, 'screen.authentication.errors.passwordTooShort'],
    [CLERK_ERROR_CODES.INVALID_EMAIL, 'screen.authentication.errors.emailInvalid'],
    [CLERK_ERROR_CODES.IDENTIFIER_NOT_FOUND, 'screen.authentication.errors.invalidCredentials'],
    [CLERK_ERROR_CODES.PASSWORD_INCORRECT, 'screen.authentication.errors.invalidCredentials'],
    [CLERK_ERROR_CODES.TOO_MANY_REQUESTS, 'screen.authentication.errors.tooManyRequests'],
  ])('maps %s to %s', (code, key) => {
    expect(translationKeyForClerkError(code)).toBe(key)
  })

  it('falls back to the generic message for unknown or missing codes', () => {
    expect(translationKeyForClerkError('anything-else')).toBe(
      'screen.authentication.errors.generic',
    )
    expect(translationKeyForClerkError(undefined)).toBe('screen.authentication.errors.generic')
    expect(translationKeyForClerkError('constructor')).toBe('screen.authentication.errors.generic')
  })
})

import {
  CLERK_ERROR_TRANSLATION_KEYS,
  CLERK_GENERIC_ERROR_KEY,
} from '../constants/clerk-error.constant'
import type { TranslationKeys } from '../i18n/types'

// Maps a Clerk error code to the translation key of the message shown to the user.
export function translationKeyForClerkError(code: string | undefined): TranslationKeys {
  if (code !== undefined && Object.hasOwn(CLERK_ERROR_TRANSLATION_KEYS, code)) {
    return CLERK_ERROR_TRANSLATION_KEYS[code]
  }
  return CLERK_GENERIC_ERROR_KEY
}

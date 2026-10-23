import type { TranslationKeys } from '../i18n/types'

// Form validation messages are translation keys (see the zod schemas and the Clerk error mapping).
// Returns the translated text of a field error, or undefined when the field has no error.
export function translateFormError(
  translate: (key: TranslationKeys) => string,
  message: string | undefined,
): string | undefined {
  return message ? translate(message as TranslationKeys) : undefined
}

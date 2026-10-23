import { createI18n, resolvePreferredLanguage } from '@clavis-via/shared'

// Uses the first supported browser preference ("es-AR" -> Spanish), with Portuguese as the default.
export function createBrowserI18n(languages: readonly string[]) {
  return createI18n(resolvePreferredLanguage(languages))
}

export const i18n = createBrowserI18n(navigator.languages)

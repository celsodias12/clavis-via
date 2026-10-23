import type { SupportedLanguage } from '../@types/language.type'
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_BY_PRIMARY_SUBTAG,
  LANGUAGE_TAG_SEPARATOR,
} from '../constants/language.constant'

// Chooses the first supported language in preference order; unknown tags do not hide later choices.
export function resolvePreferredLanguage(languageTags: readonly string[]): SupportedLanguage {
  for (const languageTag of languageTags) {
    const [primarySubtag] = languageTag.toLowerCase().split(LANGUAGE_TAG_SEPARATOR)
    const language = LANGUAGE_BY_PRIMARY_SUBTAG.get(primarySubtag)
    if (language !== undefined) {
      return language as SupportedLanguage
    }
  }
  return DEFAULT_LANGUAGE
}

// Resolves one device language tag (e.g. "es-MX"), falling back to Portuguese.
export function resolveLanguage(languageTag: string | null): SupportedLanguage {
  return resolvePreferredLanguage(languageTag === null ? [] : [languageTag])
}

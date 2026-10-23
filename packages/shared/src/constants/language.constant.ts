export const SUPPORTED_LANGUAGES = Object.freeze({
  PORTUGUESE: 'pt-BR',
  ENGLISH: 'en',
  SPANISH: 'es',
})

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.PORTUGUESE

// Maps the primary subtag of a device locale (e.g. "es" from "es-MX") to a supported language.
export const LANGUAGE_BY_PRIMARY_SUBTAG: ReadonlyMap<string, string> = new Map([
  ['pt', SUPPORTED_LANGUAGES.PORTUGUESE],
  ['en', SUPPORTED_LANGUAGES.ENGLISH],
  ['es', SUPPORTED_LANGUAGES.SPANISH],
])

export const LANGUAGE_TAG_SEPARATOR = '-'

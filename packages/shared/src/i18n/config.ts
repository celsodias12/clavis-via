import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../constants/language.constant'
import { resolveLanguage } from '../utils/language'
import { en, es, ptBr } from './locales'

// Builds an i18n instance in the language of the given device or browser language tag (e.g. "es-MX").
// Synchronous init: resources are bundled, so the first render already has translations.
export function createI18n(languageTag: string | null) {
  const instance = i18next.createInstance()
  instance.use(initReactI18next).init({
    resources: {
      [SUPPORTED_LANGUAGES.PORTUGUESE]: { translation: ptBr },
      [SUPPORTED_LANGUAGES.ENGLISH]: { translation: en },
      [SUPPORTED_LANGUAGES.SPANISH]: { translation: es },
    },
    lng: resolveLanguage(languageTag),
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
    initAsync: false,
  })
  return instance
}

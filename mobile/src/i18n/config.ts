import { createI18n, resolvePreferredLanguage } from '@clavis-via/shared'
import { getLocales } from 'expo-localization'

export const i18n = createI18n(
  resolvePreferredLanguage(getLocales().map((locale) => locale.languageTag)),
)

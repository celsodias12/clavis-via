import type { SUPPORTED_LANGUAGES } from '../constants/language.constant'

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[keyof typeof SUPPORTED_LANGUAGES]

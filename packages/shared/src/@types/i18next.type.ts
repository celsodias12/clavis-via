import type { ptBr } from '../i18n/locales'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof ptBr }
  }
}

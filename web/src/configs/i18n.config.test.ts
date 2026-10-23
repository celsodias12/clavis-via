import { SUPPORTED_LANGUAGES } from '@clavis-via/shared'
import { describe, expect, it } from 'vite-plus/test'
import { createBrowserI18n, i18n } from './i18n.config'

describe('createBrowserI18n', () => {
  it('uses the primary subtag of the first browser language', () => {
    expect(createBrowserI18n(['es-AR']).language).toBe(SUPPORTED_LANGUAGES.SPANISH)
  })

  it('understands English and Portuguese variants', () => {
    expect(createBrowserI18n(['en-US', 'es']).language).toBe(SUPPORTED_LANGUAGES.ENGLISH)
    expect(createBrowserI18n(['pt-PT']).language).toBe(SUPPORTED_LANGUAGES.PORTUGUESE)
  })

  it('falls back to Portuguese for an unsupported language', () => {
    expect(createBrowserI18n(['fr']).language).toBe(SUPPORTED_LANGUAGES.PORTUGUESE)
  })

  it('uses a supported secondary preference instead of falling back immediately', () => {
    expect(createBrowserI18n(['fr-FR', 'es-ES', 'en-US']).language).toBe(
      SUPPORTED_LANGUAGES.SPANISH,
    )
  })

  it('falls back to Portuguese when the browser reports no language', () => {
    expect(createBrowserI18n([]).language).toBe(SUPPORTED_LANGUAGES.PORTUGUESE)
  })
})

describe('i18n', () => {
  it('is built from navigator.languages', () => {
    expect(i18n.language).toBeDefined()
  })
})

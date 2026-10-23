import { describe, expect, it } from 'vite-plus/test'
import { resolveLanguage, resolvePreferredLanguage } from './language'

describe('resolveLanguage', () => {
  it.each([
    ['pt-BR', 'pt-BR'],
    ['pt-PT', 'pt-BR'],
    ['es-MX', 'es'],
    ['en-US', 'en'],
    ['fr-FR', 'pt-BR'],
    [null, 'pt-BR'],
  ])('maps %s to %s', (languageTag, expected) => {
    expect(resolveLanguage(languageTag)).toBe(expected)
  })
})

describe('resolvePreferredLanguage', () => {
  it.each([
    [['fr-FR', 'es-MX', 'en-US'], 'es'],
    [['de-DE', 'en-GB', 'pt-BR'], 'en'],
    [['pt-PT', 'en-US'], 'pt-BR'],
    [['ES-ar', 'pt-BR'], 'es'],
    [['fr-FR', 'de-DE'], 'pt-BR'],
    [[], 'pt-BR'],
  ])('selects the first supported preference from %j', (languages, expected) => {
    expect(resolvePreferredLanguage(languages)).toBe(expected)
  })
})

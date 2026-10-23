import { describe, expect, it } from 'vitest'
import { resolveRequestLanguage } from './language'

describe('resolveRequestLanguage', () => {
  it.each([
    ['en-US,en;q=0.9,pt-BR;q=0.8', 'en'],
    ['fr-FR,es-MX;q=0.9,en;q=0.8', 'es'],
    ['en;q=0,pt-BR;q=0.7', 'pt-BR'],
    ['es;q=0.4,en;q=0.9', 'en'],
    ['en;q=invalid,es;q=0.8', 'es'],
    ['en;q=1.1,es;q=0.8', 'es'],
    ['en;q=-0.1,es;q=0.8', 'es'],
    ['es;q=0.8,en;q=0.8', 'es'],
    ['fr;q=0,en;q=0', 'pt-BR'],
    ['', 'pt-BR'],
    [null, 'pt-BR'],
    ['fr-FR', 'pt-BR'],
  ] as const)('maps %s to %s', (header, expected) => {
    expect(resolveRequestLanguage(header)).toBe(expected)
  })
})

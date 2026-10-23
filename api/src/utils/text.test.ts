import { describe, expect, it } from 'vitest'
import { fillTemplate, normalizeText } from './text'

describe('fillTemplate', () => {
  it('replaces every placeholder, numbers included', () => {
    expect(fillTemplate('Dia {{day}} de {{title}}, dia {{day}}', { day: 3, title: 'Plano' })).toBe(
      'Dia 3 de Plano, dia 3',
    )
  })
})

describe('normalizeText', () => {
  it('drops accents, lowercases and collapses spaces', () => {
    expect(normalizeText('  Às vezes   QUERIA  sumir ')).toBe('as vezes queria sumir')
  })

  it('turns punctuation and hyphens into spaces', () => {
    expect(normalizeText('matar-me')).toBe('matar me')
    expect(normalizeText('Morrer!!!')).toBe('morrer')
    expect(normalizeText('self-harm, ok?')).toBe('self harm ok')
  })
})

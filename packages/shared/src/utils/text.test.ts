import { describe, expect, it } from 'vite-plus/test'
import { splitLines } from './text'

describe('splitLines', () => {
  it('splits on line breaks with a distinct id per line, even for equal lines', () => {
    expect(splitLines('Olá\nOlá\nMundo')).toEqual([
      { id: 'line-0', position: 0, content: 'Olá' },
      { id: 'line-1', position: 1, content: 'Olá' },
      { id: 'line-2', position: 2, content: 'Mundo' },
    ])
  })

  it('returns a single line when there is no break', () => {
    expect(splitLines('Só uma')).toEqual([{ id: 'line-0', position: 0, content: 'Só uma' }])
  })
})

import { TEST_IDS } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { PhraseCard } from './phrase-card.component'

describe('PhraseCard', () => {
  it('shows the phrase beside the decorative leaf', () => {
    render(<PhraseCard text="Uma frase." />)

    expect(screen.getByText('Uma frase.')).toBeTruthy()
    const leaf = screen.getByTestId(TEST_IDS.JOURNEY_PHRASE_ILLUSTRATION)
    expect(leaf.getAttribute('alt')).toBe('')
    expect(leaf.getAttribute('srcset')).toContain('journey-phrase-illustration@3x.png 140w')
  })
})

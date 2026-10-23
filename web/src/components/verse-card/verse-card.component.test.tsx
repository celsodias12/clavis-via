import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { VerseCard } from './verse-card.component'

describe('VerseCard', () => {
  it('shows the quoted verse with its reference and translation', () => {
    render(<VerseCard text="Porque eu bem sei" reference="Jeremias 29:11" onPlayPress={vi.fn()} />)

    expect(screen.getByTestId(TEST_IDS.HOME_VERSE_CARD)).toBeTruthy()
    expect(screen.getByText('Um minuto com Deus')).toBeTruthy()
    expect(screen.getByText('“Porque eu bem sei”')).toBeTruthy()
    expect(screen.getByText('Jeremias 29:11 (NVI)')).toBeTruthy()
  })

  it('calls onPlayPress from the play button', () => {
    const onPlayPress = vi.fn()
    render(<VerseCard text="x" reference="y" onPlayPress={onPlayPress} />)

    fireEvent.click(screen.getByRole('button', { name: 'Ouvir o versículo' }))

    expect(onPlayPress).toHaveBeenCalledTimes(1)
  })
})

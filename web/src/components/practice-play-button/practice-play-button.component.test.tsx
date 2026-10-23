import { PRACTICE_PLAY_STATES, TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { PracticePlayButton } from './practice-play-button.component'

describe('PracticePlayButton', () => {
  it('is a named button that reports the press', () => {
    const onPress = vi.fn()
    render(
      <PracticePlayButton state={PRACTICE_PLAY_STATES.PLAY} label="Reproduzir" onPress={onPress} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it.each([
    [PRACTICE_PLAY_STATES.PLAY, 'path', 1],
    [PRACTICE_PLAY_STATES.PAUSE, 'rect', 2],
    [PRACTICE_PLAY_STATES.AGAIN, 'path', 2],
  ])('draws the %s glyph', (state, tag, count) => {
    render(<PracticePlayButton state={state} label="Botão" onPress={() => {}} />)

    const glyphs = screen.getByTestId(TEST_IDS.PRACTICE_PLAY_BUTTON).querySelectorAll(tag)
    expect(glyphs).toHaveLength(count)
  })
})

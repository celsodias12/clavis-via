import { TEST_IDS } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { WaveCard } from './wave-card.component'

describe('WaveCard', () => {
  it('renders its children over the wave background', () => {
    render(
      <WaveCard>
        <p>conteúdo</p>
      </WaveCard>,
    )

    expect(screen.getByText('conteúdo')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.WAVE_BACKGROUND).getAttribute('aria-hidden')).toBe('true')
  })

  it('serves the image at 1x and 3x without a fixed size, so it is never stretched', () => {
    render(<WaveCard>{null}</WaveCard>)

    const image = screen.getByTestId(TEST_IDS.WAVE_BACKGROUND_IMAGE)

    expect(image.getAttribute('src')).toBe('/images/welcome-background.png')
    expect(image.getAttribute('srcset')).toBe(
      '/images/welcome-background.png 266w, /images/welcome-background@3x.png 798w',
    )
    expect(image.getAttribute('alt')).toBe('')
    expect(image.getAttribute('width')).toBeNull()
    expect(image.getAttribute('height')).toBeNull()
  })

  it('draws the fade over the seam of the image', () => {
    render(<WaveCard>{null}</WaveCard>)

    expect(screen.getByTestId(TEST_IDS.WAVE_BACKGROUND_FADE)).toBeTruthy()
  })
})

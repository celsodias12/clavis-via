import { TEST_IDS } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { SplitPage } from './split-page.component'

describe('SplitPage', () => {
  it('renders the content beside the brand, with the wave anchored to the bottom and never stretched', () => {
    render(
      <SplitPage hasTagline={false}>
        <p>conteúdo</p>
      </SplitPage>,
    )

    const image = screen.getByTestId(TEST_IDS.WAVE_BACKGROUND_IMAGE)

    expect(screen.getByText('conteúdo')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'CLAVIS VIA' })).toBeTruthy()
    expect(image.className).toContain('object-cover')
    expect(image.className).toContain('object-bottom')
    expect(image.getAttribute('srcset')).toContain('welcome-background@3x.png 798w')
    expect(screen.queryByText('todos os dias.')).toBeNull()
  })

  it('shows the three tagline lines under the brand when asked', () => {
    render(<SplitPage hasTagline>{null}</SplitPage>)

    expect(screen.getByText('Seu caminho')).toBeTruthy()
    expect(screen.getByText('de volta para si,')).toBeTruthy()
    expect(screen.getByText('todos os dias.')).toBeTruthy()
  })
})

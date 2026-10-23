import { TEST_IDS } from '@clavis-via/shared'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { DailyKeyCard } from './daily-key-card.component'

function renderCard() {
  return renderWithProviders(
    <DailyKeyCard
      label="SUA CHAVE DE HOJE"
      title="Voz e Limites"
      text="Texto da chave."
      buttonLabel="Ver prática de hoje"
      buttonLinkProps={{ to: ROUTES.PRACTICE, params: { practiceId: 'guided-breathing' } }}
    />,
  )
}

describe('DailyKeyCard', () => {
  it('shows the label, the key and a real link to the practice', async () => {
    await renderCard()

    expect(screen.getByText('SUA CHAVE DE HOJE')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Voz e Limites' })).toBeTruthy()
    expect(screen.getByText('Texto da chave.')).toBeTruthy()

    expect(screen.getByRole('link', { name: 'Ver prática de hoje' }).getAttribute('href')).toBe(
      '/practice/guided-breathing',
    )
  })

  it('serves the decorative illustration at 1x and 3x', async () => {
    await renderCard()

    const illustration = screen.getByTestId(TEST_IDS.DAILY_KEY_ILLUSTRATION)
    expect(illustration.getAttribute('src')).toBe('/images/daily-key-illustration.png')
    expect(illustration.getAttribute('srcset')).toBe(
      '/images/daily-key-illustration.png 56w, /images/daily-key-illustration@3x.png 224w',
    )
    expect(illustration.getAttribute('alt')).toBe('')
    expect(illustration.getAttribute('aria-hidden')).toBe('true')
  })

  it('paints the pastel gradient with its two patches of color', async () => {
    await renderCard()

    const card = screen.getByText('Texto da chave.').closest('[style]') as HTMLElement
    expect(card.style.backgroundImage.match(/radial-gradient/g)).toHaveLength(2)
    expect(card.style.backgroundImage).toContain('linear-gradient(45deg')
  })
})

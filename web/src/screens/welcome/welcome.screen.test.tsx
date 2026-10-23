import { SUPPORTED_LANGUAGES, TEST_IDS } from '@clavis-via/shared'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { setViewportWidth } from '../../../tests/utils/viewport'
import { i18n } from '../../configs/i18n.config'
import { ROUTES } from '../../constants/route.constant'
import { WelcomeScreen } from './welcome.screen'

describe('WelcomeScreen on a phone', () => {
  beforeEach(() => setViewportWidth(390))

  it('renders the three tagline lines, the button and the link in pt-BR', async () => {
    await renderWithProviders(<WelcomeScreen />)

    expect(screen.getByText('Seu caminho')).toBeTruthy()
    expect(screen.getByText('de volta para si,')).toBeTruthy()
    expect(screen.getByText('todos os dias.')).toBeTruthy()
    expect(screen.getByText('Começar minha jornada')).toBeTruthy()
    expect(screen.getByText('Já tenho uma conta')).toBeTruthy()
  })

  it('exposes test IDs on the two buttons', async () => {
    await renderWithProviders(<WelcomeScreen />)

    expect(screen.getByTestId(TEST_IDS.WELCOME_START)).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.WELCOME_SIGN_IN)).toBeTruthy()
  })

  it('exposes the brand as one accessible image and hides its letters', async () => {
    await renderWithProviders(<WelcomeScreen />)

    expect(screen.getByRole('img', { name: 'CLAVIS VIA' })).toBe(
      screen.getByTestId(TEST_IDS.WELCOME_BRAND),
    )
    expect(screen.getAllByText('C')[0].parentElement?.getAttribute('aria-hidden')).toBe('true')
  })

  it('goes to sign up from the button', async () => {
    const { router } = await renderWithProviders(<WelcomeScreen />)

    fireEvent.click(screen.getByText('Começar minha jornada'))

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.SIGN_UP))
  })

  it('goes to sign in from the link', async () => {
    const { router } = await renderWithProviders(<WelcomeScreen />)

    fireEvent.click(screen.getByText('Já tenho uma conta'))

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.SIGN_IN))
  })

  it('renders the whole English link without a fixed width', async () => {
    await i18n.changeLanguage(SUPPORTED_LANGUAGES.ENGLISH)
    try {
      await renderWithProviders(<WelcomeScreen />)

      const link = screen.getByTestId(TEST_IDS.WELCOME_SIGN_IN)

      expect(link.textContent).toBe('I already have an account')
      expect(link.style.width).toBe('')
    } finally {
      await i18n.changeLanguage(SUPPORTED_LANGUAGES.PORTUGUESE)
    }
  })
})

describe('WelcomeScreen on a wide screen', () => {
  it('shows the tagline as one heading, the primary action and the text link', async () => {
    await renderWithProviders(<WelcomeScreen />)

    expect(
      screen.getByRole('heading', { name: 'Seu caminho de volta para si, todos os dias.' }),
    ).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.WELCOME_START).textContent).toBe('Começar minha jornada')
    expect(screen.getByTestId(TEST_IDS.WELCOME_SIGN_IN).textContent).toBe('Já tenho uma conta')
    expect(screen.getByRole('img', { name: 'CLAVIS VIA' })).toBeTruthy()
  })

  it('goes to sign up from the button and to sign in from the link', async () => {
    const { router } = await renderWithProviders(<WelcomeScreen />)

    fireEvent.click(screen.getByTestId(TEST_IDS.WELCOME_START))
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.SIGN_UP))

    fireEvent.click(screen.getByTestId(TEST_IDS.WELCOME_SIGN_IN))
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.SIGN_IN))
  })
})

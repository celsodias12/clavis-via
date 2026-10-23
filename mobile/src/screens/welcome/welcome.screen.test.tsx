import { SUPPORTED_LANGUAGES, TEST_IDS } from '@clavis-via/shared'
import { fireEvent, screen } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { StyleSheet } from 'react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { i18n } from '../../i18n/config'
import { WelcomeScreen } from './welcome.screen'

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))

describe('WelcomeScreen', () => {
  const push = jest.fn()

  beforeEach(() => {
    push.mockReset()
    jest.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>)
  })

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

  it('exposes the brand as one accessible element and hides its letters', async () => {
    await renderWithProviders(<WelcomeScreen />)
    expect(screen.getByLabelText('CLAVIS VIA')).toBeTruthy()
    expect(screen.queryByText('C')).toBeNull()
    expect(screen.getByText('C', { includeHiddenElements: true })).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.WELCOME_BRAND)).toBeTruthy()
  })

  it('goes to sign up from the button', async () => {
    await renderWithProviders(<WelcomeScreen />)
    await fireEvent.press(screen.getByText('Começar minha jornada'))
    expect(push).toHaveBeenCalledWith(ROUTES.SIGN_UP)
  })

  it('goes to sign in from the link', async () => {
    await renderWithProviders(<WelcomeScreen />)
    await fireEvent.press(screen.getByText('Já tenho uma conta'))
    expect(push).toHaveBeenCalledWith(ROUTES.SIGN_IN)
  })

  it('renders the whole English link: sized to its text, no fixed width, no truncation', async () => {
    await i18n.changeLanguage(SUPPORTED_LANGUAGES.ENGLISH)
    try {
      await renderWithProviders(<WelcomeScreen />)
      const label = screen.getByText('I already have an account')
      expect(label.props.numberOfLines).toBeUndefined()
      const linkStyle = StyleSheet.flatten(screen.getByTestId(TEST_IDS.WELCOME_SIGN_IN).props.style)
      expect(linkStyle?.width).toBeUndefined()
      expect(StyleSheet.flatten(label.props.style)?.width).toBeUndefined()
    } finally {
      await i18n.changeLanguage(SUPPORTED_LANGUAGES.PORTUGUESE)
    }
  })
})

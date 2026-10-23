import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, screen } from '@testing-library/react-native'
import { Platform, Text } from 'react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { AuthenticationLayout } from './authentication-layout.component'

function renderLayout(overrides: Partial<Parameters<typeof AuthenticationLayout>[0]> = {}) {
  const properties = {
    title: 'Crie sua conta',
    subtitle: 'Seu caminho começa aqui.',
    onBack: jest.fn(),
    submitLabel: 'Criar conta',
    onSubmit: jest.fn(),
    isSubmitting: false,
    footerQuestion: 'Já tem uma conta?',
    footerActionLabel: 'Entrar',
    onFooterAction: jest.fn(),
    ...overrides,
  }
  return {
    properties,
    rendered: renderWithProviders(
      <AuthenticationLayout {...properties}>
        <Text>campos</Text>
      </AuthenticationLayout>,
    ),
  }
}

describe('AuthenticationLayout', () => {
  it('renders the title, the subtitle, the children, the button and the footer', async () => {
    await renderLayout().rendered
    expect(screen.getByText('Crie sua conta')).toBeTruthy()
    expect(screen.getByText('Seu caminho começa aqui.')).toBeTruthy()
    expect(screen.getByText('campos')).toBeTruthy()
    expect(screen.getByText('Criar conta')).toBeTruthy()
    expect(screen.getByText('Entrar')).toBeTruthy()
    expect(
      screen.getByTestId(TEST_IDS.WAVE_BACKGROUND, { includeHiddenElements: true }),
    ).toBeTruthy()
  })

  it('splits the title and the subtitle on line breaks, one text per line', async () => {
    await renderLayout({
      title: 'Entrar na\nsua conta',
      subtitle: 'Use o email e a senha que\nvocê cadastrou.',
    }).rendered
    expect(screen.getByText('Entrar na')).toBeTruthy()
    expect(screen.getByText('sua conta')).toBeTruthy()
    expect(screen.getByText('Use o email e a senha que')).toBeTruthy()
    expect(screen.getByText('você cadastrou.')).toBeTruthy()
  })

  it('calls onBack from the arrow', async () => {
    const { properties, rendered } = renderLayout()
    await rendered
    await fireEvent.press(screen.getByLabelText('Voltar'))
    expect(properties.onBack).toHaveBeenCalledTimes(1)
  })

  it.each(['ios', 'android'] as const)(
    'calls onSubmit once from the button on %s',
    async (platform) => {
      const operatingSystem = jest.replaceProperty(Platform, 'OS', platform)
      try {
        const { properties, rendered } = renderLayout()
        await rendered
        await fireEvent.press(screen.getByText('Criar conta'))
        expect(properties.onSubmit).toHaveBeenCalledTimes(1)
      } finally {
        operatingSystem.restore()
      }
    },
  )

  it('shows the spinner and blocks the button while submitting', async () => {
    const { properties, rendered } = renderLayout({ isSubmitting: true })
    await rendered
    expect(screen.getByTestId(`${TEST_IDS.AUTHENTICATION_SUBMIT}-spinner`)).toBeTruthy()
    expect(screen.queryByText('Criar conta')).toBeNull()
    await fireEvent.press(screen.getByTestId(TEST_IDS.AUTHENTICATION_SUBMIT))
    expect(properties.onSubmit).not.toHaveBeenCalled()
  })

  it('shows the form error above the button as a live region', async () => {
    await renderLayout({ formErrorMessage: 'Algo deu errado.' }).rendered
    const error = screen.getByTestId(TEST_IDS.AUTHENTICATION_FORM_ERROR)
    expect(error.props.accessibilityLiveRegion).toBe('polite')
    expect(screen.getByText('Algo deu errado.')).toBeTruthy()
  })

  it('shows no form error when there is none', async () => {
    await renderLayout().rendered
    expect(screen.queryByTestId(TEST_IDS.AUTHENTICATION_FORM_ERROR)).toBeNull()
  })

  it('calls onFooterAction from the footer', async () => {
    const { properties, rendered } = renderLayout()
    await rendered
    await fireEvent.press(screen.getByText('Entrar'))
    expect(properties.onFooterAction).toHaveBeenCalledTimes(1)
  })
})

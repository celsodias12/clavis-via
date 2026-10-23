import { CLERK_ERROR_CODES, TEST_IDS } from '@clavis-via/shared'
import { useSignUp } from '@clerk/expo'
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { Keyboard } from 'react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { SignUpScreen } from './sign-up.screen'

jest.mock('@clerk/expo', () => require('../../../tests/utils/clerk-mock').clerkModule)
jest.mock('expo-router', () => ({ useRouter: jest.fn() }))

type SignUpMock = {
  password: jest.Mock
  finalize: jest.Mock
  status: string
}

const noErrors = { fields: {}, global: null, raw: null }

function mockSignUp(
  signUp: Partial<SignUpMock> = {},
  errors: Record<string, unknown> = noErrors,
): SignUpMock {
  const resource: SignUpMock = {
    password: jest.fn(async () => ({ error: null })),
    finalize: jest.fn(async () => ({ error: null })),
    status: 'complete',
    ...signUp,
  }
  jest.mocked(useSignUp).mockReturnValue({
    signUp: resource,
    errors,
    fetchStatus: 'idle',
  } as unknown as ReturnType<typeof useSignUp>)
  return resource
}

async function fillForm() {
  await fireEvent.changeText(screen.getByTestId(TEST_IDS.SIGN_UP_FIRST_NAME), ' Ana ')
  await fireEvent.changeText(screen.getByTestId(TEST_IDS.SIGN_UP_EMAIL), 'Ana@Email.com')
  await fireEvent.changeText(screen.getByTestId(TEST_IDS.SIGN_UP_PASSWORD), '12345678')
}

async function submitValidForm() {
  await fillForm()
  await fireEvent.press(screen.getByText('Criar conta'))
}

describe('SignUpScreen', () => {
  const back = jest.fn()
  const replace = jest.fn()

  beforeEach(() => {
    back.mockReset()
    replace.mockReset()
    jest
      .mocked(useRouter)
      .mockReturnValue({ back, replace } as unknown as ReturnType<typeof useRouter>)
  })

  it('renders the copy, the three fields and the footer in pt-BR', async () => {
    mockSignUp()
    await renderWithProviders(<SignUpScreen />)
    expect(screen.getByText('Crie sua conta')).toBeTruthy()
    expect(screen.getByText('Seu caminho começa aqui.')).toBeTruthy()
    expect(screen.getByText('Nome')).toBeTruthy()
    expect(screen.getByPlaceholderText('Como podemos te chamar?')).toBeTruthy()
    expect(screen.getByText('Email')).toBeTruthy()
    expect(screen.getByPlaceholderText('voce@email.com')).toBeTruthy()
    expect(screen.getByText('Senha')).toBeTruthy()
    expect(screen.getByPlaceholderText('Mínimo de 8 caracteres')).toBeTruthy()
    expect(screen.getByText('Criar conta')).toBeTruthy()
    expect(screen.getByText('Já tem uma conta?', { exact: false })).toBeTruthy()
    expect(screen.getByText('Entrar')).toBeTruthy()
  })

  it('configures the keyboard of each field', async () => {
    mockSignUp()
    await renderWithProviders(<SignUpScreen />)
    const email = screen.getByTestId(TEST_IDS.SIGN_UP_EMAIL)
    expect(email.props.keyboardType).toBe('email-address')
    expect(email.props.autoCapitalize).toBe('none')
    expect(screen.getByTestId(TEST_IDS.SIGN_UP_PASSWORD).props.secureTextEntry).toBe(true)
  })

  it('shows the three field errors and never calls the sign-up when submitting empty', async () => {
    const signUp = mockSignUp()
    await renderWithProviders(<SignUpScreen />)
    await fireEvent.press(screen.getByText('Criar conta'))
    expect(await screen.findByText('Digite seu nome.')).toBeTruthy()
    expect(screen.getByText('Digite um email válido.')).toBeTruthy()
    expect(screen.getByText('A senha precisa ter pelo menos 8 caracteres.')).toBeTruthy()
    expect(signUp.password).not.toHaveBeenCalled()
  })

  it('dismisses the keyboard once when the form is invalid', async () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss')
    dismiss.mockClear()
    mockSignUp()
    await renderWithProviders(<SignUpScreen />)
    await fireEvent.press(screen.getByText('Criar conta'))
    await screen.findByText('Digite seu nome.')
    expect(dismiss).toHaveBeenCalledTimes(1)
  })

  it('dismisses the keyboard once when Clerk returns an error', async () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss')
    dismiss.mockClear()
    const code = CLERK_ERROR_CODES.PASSWORD_INCORRECT
    mockSignUp(
      { password: jest.fn(async () => ({ error: { code } })) },
      { fields: { password: { code, message: 'x' } }, global: null, raw: null },
    )
    await renderWithProviders(<SignUpScreen />)
    await submitValidForm()
    await waitFor(() => expect(dismiss).toHaveBeenCalledTimes(1))
  })

  it('signs up with the cleaned values and finalizes when the status is complete', async () => {
    const signUp = mockSignUp()
    await renderWithProviders(<SignUpScreen />)
    await fillForm()
    await fireEvent.press(screen.getByText('Criar conta'))
    await waitFor(() => expect(signUp.finalize).toHaveBeenCalledTimes(1))
    expect(signUp.password).toHaveBeenCalledTimes(1)
    expect(signUp.password).toHaveBeenCalledWith({
      firstName: 'Ana',
      emailAddress: 'ana@email.com',
      password: '12345678',
    })
    const { navigate } = signUp.finalize.mock.calls[0][0]
    navigate()
    expect(replace).toHaveBeenCalledWith(ROUTES.START)
  })

  it('calls the sign-up once when the button is pressed twice while it is pending', async () => {
    let resolvePassword: (value: { error: null }) => void = () => {}
    const signUp = mockSignUp({
      password: jest.fn(
        () =>
          new Promise<{ error: null }>((resolve) => {
            resolvePassword = resolve
          }),
      ),
    })
    await renderWithProviders(<SignUpScreen />)
    await fillForm()
    await fireEvent.press(screen.getByText('Criar conta'))
    await waitFor(() => expect(signUp.password).toHaveBeenCalledTimes(1))
    await fireEvent.press(screen.getByTestId(TEST_IDS.AUTHENTICATION_SUBMIT))
    expect(screen.getByTestId(`${TEST_IDS.AUTHENTICATION_SUBMIT}-spinner`)).toBeTruthy()
    await act(async () => {
      resolvePassword({ error: null })
    })
    await waitFor(() => expect(signUp.finalize).toHaveBeenCalledTimes(1))
    expect(signUp.password).toHaveBeenCalledTimes(1)
  })

  it('shows the email-in-use message under the email field', async () => {
    mockSignUp(
      { password: jest.fn(async () => ({ error: { code: CLERK_ERROR_CODES.IDENTIFIER_EXISTS } })) },
      {
        fields: { emailAddress: { code: CLERK_ERROR_CODES.IDENTIFIER_EXISTS, message: 'taken' } },
        global: null,
        raw: null,
      },
    )
    await renderWithProviders(<SignUpScreen />)
    await submitValidForm()
    expect(await screen.findByText('Este email já está em uso.')).toBeTruthy()
    expect(screen.getByTestId(`${TEST_IDS.SIGN_UP_EMAIL}-error`)).toBeTruthy()
  })

  it('maps the first name and password errors to their fields', async () => {
    mockSignUp(
      { password: jest.fn(async () => ({ error: { code: 'form_param_nil' } })) },
      {
        fields: {
          firstName: { code: 'form_param_nil', message: 'x' },
          password: { code: CLERK_ERROR_CODES.PASSWORD_TOO_SHORT, message: 'y' },
        },
        global: null,
        raw: null,
      },
    )
    await renderWithProviders(<SignUpScreen />)
    await submitValidForm()
    expect(await screen.findByTestId(`${TEST_IDS.SIGN_UP_FIRST_NAME}-error`)).toBeTruthy()
    expect(screen.getByTestId(`${TEST_IDS.SIGN_UP_PASSWORD}-error`)).toBeTruthy()
    expect(screen.getAllByText('Algo deu errado. Tente de novo.')).toHaveLength(1)
    expect(screen.getByText('A senha precisa ter pelo menos 8 caracteres.')).toBeTruthy()
  })

  it('ignores Clerk errors left over from an earlier visit until a request is sent', async () => {
    mockSignUp(
      {},
      {
        fields: { emailAddress: { code: CLERK_ERROR_CODES.IDENTIFIER_EXISTS, message: 'taken' } },
        global: [{ code: CLERK_ERROR_CODES.TOO_MANY_REQUESTS, message: 'slow down' }],
        raw: null,
      },
    )
    await renderWithProviders(<SignUpScreen />)
    expect(screen.queryByText('Este email já está em uso.')).toBeNull()
    expect(screen.queryByTestId(TEST_IDS.AUTHENTICATION_FORM_ERROR)).toBeNull()
  })

  it('shows a global Clerk error above the button', async () => {
    mockSignUp(
      { password: jest.fn(async () => ({ error: { code: CLERK_ERROR_CODES.TOO_MANY_REQUESTS } })) },
      {
        fields: {},
        global: [{ code: CLERK_ERROR_CODES.TOO_MANY_REQUESTS, message: 'slow down' }],
        raw: null,
      },
    )
    await renderWithProviders(<SignUpScreen />)
    await submitValidForm()
    expect(await screen.findByTestId(TEST_IDS.AUTHENTICATION_FORM_ERROR)).toBeTruthy()
    expect(screen.getByText('Muitas tentativas. Tente de novo em alguns minutos.')).toBeTruthy()
  })

  it('shows the generic message above the button when the status is not complete', async () => {
    const signUp = mockSignUp({ status: 'missing_requirements' })
    await renderWithProviders(<SignUpScreen />)
    await fillForm()
    await fireEvent.press(screen.getByText('Criar conta'))
    expect(await screen.findByText('Algo deu errado. Tente de novo.')).toBeTruthy()
    expect(signUp.finalize).not.toHaveBeenCalled()
  })

  it('does not finalize when the sign-up call returns an error', async () => {
    const signUp = mockSignUp({
      password: jest.fn(async () => ({ error: { code: 'form_identifier_exists' } })),
    })
    await renderWithProviders(<SignUpScreen />)
    await fillForm()
    await fireEvent.press(screen.getByText('Criar conta'))
    await waitFor(() => expect(signUp.password).toHaveBeenCalledTimes(1))
    expect(signUp.finalize).not.toHaveBeenCalled()
    expect(screen.queryByTestId(TEST_IDS.AUTHENTICATION_FORM_ERROR)).toBeNull()
  })

  it('shows the generic message when finalize returns an error', async () => {
    mockSignUp({ finalize: jest.fn(async () => ({ error: { code: 'boom' } })) })
    await renderWithProviders(<SignUpScreen />)
    await fillForm()
    await fireEvent.press(screen.getByText('Criar conta'))
    expect(await screen.findByText('Algo deu errado. Tente de novo.')).toBeTruthy()
  })

  it('clears the form error when submitting again', async () => {
    const signUp = mockSignUp({ status: 'missing_requirements' })
    await renderWithProviders(<SignUpScreen />)
    await fillForm()
    await fireEvent.press(screen.getByText('Criar conta'))
    expect(await screen.findByText('Algo deu errado. Tente de novo.')).toBeTruthy()
    signUp.status = 'complete'
    await fireEvent.press(screen.getByText('Criar conta'))
    await waitFor(() => expect(signUp.finalize).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('Algo deu errado. Tente de novo.')).toBeNull()
  })

  it('goes back from the arrow and replaces the route with sign in from the footer', async () => {
    mockSignUp()
    await renderWithProviders(<SignUpScreen />)
    await fireEvent.press(screen.getByLabelText('Voltar'))
    expect(back).toHaveBeenCalledTimes(1)
    await fireEvent.press(screen.getByText('Entrar'))
    expect(replace).toHaveBeenCalledWith(ROUTES.SIGN_IN)
  })

  it('moves focus along the fields and submits from the keyboard on the last one', async () => {
    const signUp = mockSignUp()
    await renderWithProviders(<SignUpScreen />)
    await fillForm()
    await fireEvent(screen.getByTestId(TEST_IDS.SIGN_UP_FIRST_NAME), 'submitEditing')
    await fireEvent(screen.getByTestId(TEST_IDS.SIGN_UP_EMAIL), 'submitEditing')
    expect(signUp.password).not.toHaveBeenCalled()
    await fireEvent(screen.getByTestId(TEST_IDS.SIGN_UP_PASSWORD), 'submitEditing')
    await waitFor(() => expect(signUp.password).toHaveBeenCalledTimes(1))
  })
})

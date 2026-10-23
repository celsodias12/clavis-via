import { CLERK_ERROR_CODES, TEST_IDS } from '@clavis-via/shared'
import { useSignIn } from '@clerk/expo'
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { Keyboard } from 'react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { SignInScreen } from './sign-in.screen'

jest.mock('@clerk/expo', () => require('../../../tests/utils/clerk-mock').clerkModule)
jest.mock('expo-router', () => ({ useRouter: jest.fn() }))

type SignInMock = {
  password: jest.Mock
  finalize: jest.Mock
  status: string
}

const noErrors = { fields: {}, global: null, raw: null }

function mockSignIn(
  signIn: Partial<SignInMock> = {},
  errors: Record<string, unknown> = noErrors,
): SignInMock {
  const resource: SignInMock = {
    password: jest.fn(async () => ({ error: null })),
    finalize: jest.fn(async () => ({ error: null })),
    status: 'complete',
    ...signIn,
  }
  jest.mocked(useSignIn).mockReturnValue({
    signIn: resource,
    errors,
    fetchStatus: 'idle',
  } as unknown as ReturnType<typeof useSignIn>)
  return resource
}

async function fillForm() {
  await fireEvent.changeText(screen.getByTestId(TEST_IDS.SIGN_IN_EMAIL), ' Ana@Email.com ')
  await fireEvent.changeText(screen.getByTestId(TEST_IDS.SIGN_IN_PASSWORD), 'segredo')
}

async function submitValidForm() {
  await fillForm()
  await fireEvent.press(screen.getByTestId(TEST_IDS.AUTHENTICATION_SUBMIT))
}

describe('SignInScreen', () => {
  const back = jest.fn()
  const replace = jest.fn()

  beforeEach(() => {
    back.mockReset()
    replace.mockReset()
    jest
      .mocked(useRouter)
      .mockReturnValue({ back, replace } as unknown as ReturnType<typeof useRouter>)
  })

  it('renders the copy, the two fields and the footer in pt-BR', async () => {
    mockSignIn()
    await renderWithProviders(<SignInScreen />)
    expect(screen.getByText('Entrar na')).toBeTruthy()
    expect(screen.getByText('sua conta')).toBeTruthy()
    expect(screen.getByText('Use o email e a senha que')).toBeTruthy()
    expect(screen.getByText('você cadastrou.')).toBeTruthy()
    expect(screen.getByText('Email')).toBeTruthy()
    expect(screen.getByPlaceholderText('voce@email.com')).toBeTruthy()
    expect(screen.getByText('Senha')).toBeTruthy()
    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy()
    expect(screen.getByText('Ainda não tem conta?', { exact: false })).toBeTruthy()
    expect(screen.getByText('Criar conta')).toBeTruthy()
  })

  it('configures the keyboard of each field', async () => {
    mockSignIn()
    await renderWithProviders(<SignInScreen />)
    const email = screen.getByTestId(TEST_IDS.SIGN_IN_EMAIL)
    expect(email.props.keyboardType).toBe('email-address')
    expect(email.props.autoCapitalize).toBe('none')
    expect(screen.getByTestId(TEST_IDS.SIGN_IN_PASSWORD).props.secureTextEntry).toBe(true)
  })

  it('shows the field errors and never calls the sign-in when submitting empty', async () => {
    const signIn = mockSignIn()
    await renderWithProviders(<SignInScreen />)
    await fireEvent.press(screen.getByTestId(TEST_IDS.AUTHENTICATION_SUBMIT))
    expect(await screen.findByText('Digite um email válido.')).toBeTruthy()
    expect(screen.getByText('Digite sua senha.')).toBeTruthy()
    expect(signIn.password).not.toHaveBeenCalled()
  })

  it('dismisses the keyboard once when the form is invalid', async () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss')
    dismiss.mockClear()
    mockSignIn()
    await renderWithProviders(<SignInScreen />)
    await fireEvent.press(screen.getByTestId(TEST_IDS.AUTHENTICATION_SUBMIT))
    await screen.findByText('Digite um email válido.')
    expect(dismiss).toHaveBeenCalledTimes(1)
  })

  it('dismisses the keyboard once when Clerk rejects the credentials', async () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss')
    dismiss.mockClear()
    const code = CLERK_ERROR_CODES.PASSWORD_INCORRECT
    mockSignIn(
      { password: jest.fn(async () => ({ error: { code } })) },
      { fields: { password: { code, message: 'x' } }, global: null, raw: null },
    )
    await renderWithProviders(<SignInScreen />)
    await submitValidForm()
    await waitFor(() => expect(dismiss).toHaveBeenCalledTimes(1))
  })

  it('signs in with the cleaned values and finalizes when the status is complete', async () => {
    const signIn = mockSignIn()
    await renderWithProviders(<SignInScreen />)
    await submitValidForm()
    await waitFor(() => expect(signIn.finalize).toHaveBeenCalledTimes(1))
    expect(signIn.password).toHaveBeenCalledTimes(1)
    expect(signIn.password).toHaveBeenCalledWith({
      emailAddress: 'ana@email.com',
      password: 'segredo',
    })
    const { navigate } = signIn.finalize.mock.calls[0][0]
    navigate()
    expect(replace).toHaveBeenCalledWith(ROUTES.START)
  })

  it('calls the sign-in once when the button is pressed twice while it is pending', async () => {
    let resolvePassword: (value: { error: null }) => void = () => {}
    const signIn = mockSignIn({
      password: jest.fn(
        () =>
          new Promise<{ error: null }>((resolve) => {
            resolvePassword = resolve
          }),
      ),
    })
    await renderWithProviders(<SignInScreen />)
    await submitValidForm()
    await waitFor(() => expect(signIn.password).toHaveBeenCalledTimes(1))
    await fireEvent.press(screen.getByTestId(TEST_IDS.AUTHENTICATION_SUBMIT))
    expect(screen.getByTestId(`${TEST_IDS.AUTHENTICATION_SUBMIT}-spinner`)).toBeTruthy()
    await act(async () => {
      resolvePassword({ error: null })
    })
    await waitFor(() => expect(signIn.finalize).toHaveBeenCalledTimes(1))
    expect(signIn.password).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['identifier', CLERK_ERROR_CODES.IDENTIFIER_NOT_FOUND],
    ['password', CLERK_ERROR_CODES.PASSWORD_INCORRECT],
  ])('shows the same message above the button for a %s error', async (field, code) => {
    mockSignIn(
      { password: jest.fn(async () => ({ error: { code } })) },
      { fields: { [field]: { code, message: 'x' } }, global: null, raw: null },
    )
    await renderWithProviders(<SignInScreen />)
    await submitValidForm()
    expect(await screen.findByText('Email ou senha incorretos.')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.AUTHENTICATION_FORM_ERROR)).toBeTruthy()
    expect(screen.queryByTestId(`${TEST_IDS.SIGN_IN_EMAIL}-error`)).toBeNull()
    expect(screen.queryByTestId(`${TEST_IDS.SIGN_IN_PASSWORD}-error`)).toBeNull()
  })

  it('shows the too-many-requests message for a global Clerk error', async () => {
    mockSignIn(
      { password: jest.fn(async () => ({ error: { code: CLERK_ERROR_CODES.TOO_MANY_REQUESTS } })) },
      {
        fields: {},
        global: [{ code: CLERK_ERROR_CODES.TOO_MANY_REQUESTS, message: 'slow down' }],
        raw: null,
      },
    )
    await renderWithProviders(<SignInScreen />)
    await submitValidForm()
    expect(
      await screen.findByText('Muitas tentativas. Tente de novo em alguns minutos.'),
    ).toBeTruthy()
  })

  it('ignores Clerk errors left over from an earlier visit until a request is sent', async () => {
    mockSignIn(
      {},
      {
        fields: {
          identifier: { code: CLERK_ERROR_CODES.IDENTIFIER_NOT_FOUND, message: 'x' },
        },
        global: [{ code: CLERK_ERROR_CODES.TOO_MANY_REQUESTS, message: 'slow down' }],
        raw: null,
      },
    )
    await renderWithProviders(<SignInScreen />)
    expect(screen.queryByTestId(TEST_IDS.AUTHENTICATION_FORM_ERROR)).toBeNull()
  })

  it.each(['needs_second_factor', 'needs_client_trust'])(
    'shows the generic message when the status is %s',
    async (status) => {
      const signIn = mockSignIn({ status })
      await renderWithProviders(<SignInScreen />)
      await submitValidForm()
      expect(await screen.findByText('Algo deu errado. Tente de novo.')).toBeTruthy()
      expect(signIn.finalize).not.toHaveBeenCalled()
    },
  )

  it('does not finalize when the sign-in call returns an error without a mapped message', async () => {
    const signIn = mockSignIn({
      password: jest.fn(async () => ({ error: { code: 'something_else' } })),
    })
    await renderWithProviders(<SignInScreen />)
    await submitValidForm()
    await waitFor(() => expect(signIn.password).toHaveBeenCalledTimes(1))
    expect(signIn.finalize).not.toHaveBeenCalled()
    expect(screen.queryByTestId(TEST_IDS.AUTHENTICATION_FORM_ERROR)).toBeNull()
  })

  it('shows the generic message when finalize returns an error', async () => {
    mockSignIn({ finalize: jest.fn(async () => ({ error: { code: 'boom' } })) })
    await renderWithProviders(<SignInScreen />)
    await submitValidForm()
    expect(await screen.findByText('Algo deu errado. Tente de novo.')).toBeTruthy()
  })

  it('clears the form error when submitting again', async () => {
    const signIn = mockSignIn({ status: 'needs_client_trust' })
    await renderWithProviders(<SignInScreen />)
    await submitValidForm()
    expect(await screen.findByText('Algo deu errado. Tente de novo.')).toBeTruthy()
    signIn.status = 'complete'
    await fireEvent.press(screen.getByTestId(TEST_IDS.AUTHENTICATION_SUBMIT))
    await waitFor(() => expect(signIn.finalize).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('Algo deu errado. Tente de novo.')).toBeNull()
  })

  it('goes back from the arrow and replaces the route with sign up from the footer', async () => {
    mockSignIn()
    await renderWithProviders(<SignInScreen />)
    await fireEvent.press(screen.getByLabelText('Voltar'))
    expect(back).toHaveBeenCalledTimes(1)
    await fireEvent.press(screen.getByText('Criar conta'))
    expect(replace).toHaveBeenCalledWith(ROUTES.SIGN_UP)
  })

  it('moves focus to the password and submits from the keyboard on the last field', async () => {
    const signIn = mockSignIn()
    await renderWithProviders(<SignInScreen />)
    await fillForm()
    await fireEvent(screen.getByTestId(TEST_IDS.SIGN_IN_EMAIL), 'submitEditing')
    expect(signIn.password).not.toHaveBeenCalled()
    await fireEvent(screen.getByTestId(TEST_IDS.SIGN_IN_PASSWORD), 'submitEditing')
    await waitFor(() => expect(signIn.password).toHaveBeenCalledTimes(1))
  })
})

import { CLERK_ERROR_CODES, TEST_IDS } from '@clavis-via/shared'
import { useSignIn } from '@clerk/react'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { SignInScreen } from './sign-in.screen'

type SignInMock = {
  password: ReturnType<typeof vi.fn>
  finalize: ReturnType<typeof vi.fn>
  status: string
}

const noErrors = { fields: {}, global: null, raw: null }

function mockSignIn(
  signIn: Partial<SignInMock> = {},
  errors: Record<string, unknown> = noErrors,
): SignInMock {
  const resource: SignInMock = {
    password: vi.fn(async () => ({ error: null })),
    finalize: vi.fn(async () => ({ error: null })),
    status: 'complete',
    ...signIn,
  }
  vi.mocked(useSignIn).mockReturnValue({
    signIn: resource,
    errors,
    fetchStatus: 'idle',
  } as unknown as ReturnType<typeof useSignIn>)
  return resource
}

function type(testID: string, value: string) {
  fireEvent.change(screen.getByTestId(testID), { target: { value } })
}

function fillForm() {
  type(TEST_IDS.SIGN_IN_EMAIL, ' Ana@Email.com ')
  type(TEST_IDS.SIGN_IN_PASSWORD, 'segredo')
}

function submitButton() {
  return screen.getByTestId(TEST_IDS.AUTHENTICATION_SUBMIT)
}

function submitValidForm() {
  fillForm()
  fireEvent.click(submitButton())
}

describe('SignInScreen', () => {
  it('renders the copy, the two fields and the footer in pt-BR', async () => {
    mockSignIn()
    await renderWithProviders(<SignInScreen />)

    expect(screen.getByRole('heading', { name: 'Entrar na sua conta' })).toBeTruthy()
    expect(screen.getByText('Use o email e a senha que você cadastrou.')).toBeTruthy()
    expect(screen.getByLabelText('Email')).toBeTruthy()
    expect(screen.getByPlaceholderText('voce@email.com')).toBeTruthy()
    expect(screen.getByLabelText('Senha')).toBeTruthy()
    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy()
    expect(screen.getByText('Ainda não tem conta?', { exact: false })).toBeTruthy()
    expect(screen.getByText('Criar conta')).toBeTruthy()
  })

  it('configures the keyboard of each field', async () => {
    mockSignIn()
    await renderWithProviders(<SignInScreen />)

    expect(screen.getByTestId(TEST_IDS.SIGN_IN_EMAIL).getAttribute('type')).toBe('email')
    expect(screen.getByTestId(TEST_IDS.SIGN_IN_PASSWORD).getAttribute('type')).toBe('password')
  })

  it('shows the field errors and never calls the sign-in when submitting empty', async () => {
    const signIn = mockSignIn()
    await renderWithProviders(<SignInScreen />)

    fireEvent.click(submitButton())

    expect(await screen.findByText('Digite um email válido.')).toBeTruthy()
    expect(screen.getByText('Digite sua senha.')).toBeTruthy()
    expect(signIn.password).not.toHaveBeenCalled()
  })

  it('signs in with the cleaned values and finalizes when the status is complete', async () => {
    const signIn = mockSignIn()
    const { router } = await renderWithProviders(<SignInScreen />)

    submitValidForm()

    await waitFor(() => expect(signIn.finalize).toHaveBeenCalledTimes(1))
    expect(signIn.password).toHaveBeenCalledWith({
      emailAddress: 'ana@email.com',
      password: 'segredo',
    })
    await act(async () => signIn.finalize.mock.calls[0][0].navigate())
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.START))
  })

  it('calls the sign-in once when the button is pressed twice while it is pending', async () => {
    let resolvePassword: (value: { error: null }) => void = () => {}
    const signIn = mockSignIn({
      password: vi.fn(
        () =>
          new Promise<{ error: null }>((resolve) => {
            resolvePassword = resolve
          }),
      ),
    })
    await renderWithProviders(<SignInScreen />)
    fillForm()

    fireEvent.click(submitButton())
    fireEvent.click(submitButton())
    await waitFor(() => expect(signIn.password).toHaveBeenCalledTimes(1))
    fireEvent.click(submitButton())

    expect(screen.getByTestId(`${TEST_IDS.AUTHENTICATION_SUBMIT}-spinner`)).toBeTruthy()
    await act(async () => resolvePassword({ error: null }))
    await waitFor(() => expect(signIn.finalize).toHaveBeenCalledTimes(1))
    expect(signIn.password).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['identifier', CLERK_ERROR_CODES.IDENTIFIER_NOT_FOUND],
    ['password', CLERK_ERROR_CODES.PASSWORD_INCORRECT],
  ])('shows the same message above the button for a %s error', async (field, code) => {
    mockSignIn(
      { password: vi.fn(async () => ({ error: { code } })) },
      { fields: { [field]: { code, message: 'x' } }, global: null, raw: null },
    )
    await renderWithProviders(<SignInScreen />)

    submitValidForm()

    expect(await screen.findByText('Email ou senha incorretos.')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.AUTHENTICATION_FORM_ERROR)).toBeTruthy()
    expect(screen.queryByTestId(`${TEST_IDS.SIGN_IN_EMAIL}-error`)).toBeNull()
    expect(screen.queryByTestId(`${TEST_IDS.SIGN_IN_PASSWORD}-error`)).toBeNull()
  })

  it('shows the too-many-requests message for a global Clerk error', async () => {
    mockSignIn(
      { password: vi.fn(async () => ({ error: { code: CLERK_ERROR_CODES.TOO_MANY_REQUESTS } })) },
      {
        fields: {},
        global: [{ code: CLERK_ERROR_CODES.TOO_MANY_REQUESTS, message: 'slow down' }],
        raw: null,
      },
    )
    await renderWithProviders(<SignInScreen />)

    submitValidForm()

    expect(
      await screen.findByText('Muitas tentativas. Tente de novo em alguns minutos.'),
    ).toBeTruthy()
  })

  it('ignores Clerk errors left over from an earlier visit until a request is sent', async () => {
    mockSignIn(
      {},
      {
        fields: { identifier: { code: CLERK_ERROR_CODES.IDENTIFIER_NOT_FOUND, message: 'x' } },
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

      submitValidForm()

      expect(await screen.findByText('Algo deu errado. Tente de novo.')).toBeTruthy()
      expect(signIn.finalize).not.toHaveBeenCalled()
    },
  )

  it('does not finalize when the sign-in call returns an error without a mapped message', async () => {
    const signIn = mockSignIn({
      password: vi.fn(async () => ({ error: { code: 'something_else' } })),
    })
    await renderWithProviders(<SignInScreen />)

    submitValidForm()

    await waitFor(() => expect(signIn.password).toHaveBeenCalledTimes(1))
    expect(signIn.finalize).not.toHaveBeenCalled()
    expect(screen.queryByTestId(TEST_IDS.AUTHENTICATION_FORM_ERROR)).toBeNull()
  })

  it('shows the generic message when finalize returns an error', async () => {
    mockSignIn({ finalize: vi.fn(async () => ({ error: { code: 'boom' } })) })
    await renderWithProviders(<SignInScreen />)

    submitValidForm()

    expect(await screen.findByText('Algo deu errado. Tente de novo.')).toBeTruthy()
  })

  it('clears the form error when submitting again', async () => {
    const signIn = mockSignIn({ status: 'needs_client_trust' })
    await renderWithProviders(<SignInScreen />)
    submitValidForm()
    expect(await screen.findByText('Algo deu errado. Tente de novo.')).toBeTruthy()

    signIn.status = 'complete'
    await waitFor(() => expect(submitButton().hasAttribute('disabled')).toBe(false))
    fireEvent.click(submitButton())

    await waitFor(() => expect(signIn.finalize).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('Algo deu errado. Tente de novo.')).toBeNull()
  })

  it('goes back from the arrow and replaces the route with sign up from the footer', async () => {
    mockSignIn()
    const { router } = await renderWithProviders(<SignInScreen />)
    await act(async () => router.navigate({ to: ROUTES.SIGN_IN }))

    fireEvent.click(screen.getByLabelText('Voltar'))
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.WELCOME))

    await act(async () => router.navigate({ to: ROUTES.SIGN_IN }))
    fireEvent.click(screen.getByText('Criar conta'))
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.SIGN_UP))
  })

  it('sends a direct visit to the entry page from the arrow instead of leaving the site', async () => {
    mockSignIn()
    const { router } = await renderWithProviders(<SignInScreen />, { route: ROUTES.SIGN_IN })
    const navigate = vi.spyOn(router, 'navigate')

    fireEvent.click(screen.getByLabelText('Voltar'))

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.WELCOME))
    expect(navigate).toHaveBeenCalledWith({ to: ROUTES.WELCOME, replace: true })
  })

  it('is one native form, so Enter in any field submits it', async () => {
    const signIn = mockSignIn()
    await renderWithProviders(<SignInScreen />)
    fillForm()
    const form = screen.getByTestId(TEST_IDS.SIGN_IN_PASSWORD).closest('form') as HTMLFormElement

    expect(screen.getByTestId(TEST_IDS.SIGN_IN_EMAIL).closest('form')).toBe(form)
    expect(screen.getByTestId(TEST_IDS.AUTHENTICATION_SUBMIT).getAttribute('type')).toBe('submit')
    expect(signIn.password).not.toHaveBeenCalled()

    fireEvent.submit(form)

    await waitFor(() => expect(signIn.password).toHaveBeenCalledTimes(1))
  })

  it('ignores a second submit while a request is running', async () => {
    let resolvePassword: (value: { error: null }) => void = () => {}
    const signIn = mockSignIn({
      password: vi.fn(
        () =>
          new Promise<{ error: null }>((resolve) => {
            resolvePassword = resolve
          }),
      ),
    })
    await renderWithProviders(<SignInScreen />)
    fillForm()
    const form = screen.getByTestId(TEST_IDS.SIGN_IN_PASSWORD).closest('form') as HTMLFormElement
    fireEvent.submit(form)
    await waitFor(() => expect(signIn.password).toHaveBeenCalledTimes(1))

    fireEvent.submit(form)

    expect(signIn.password).toHaveBeenCalledTimes(1)
    await act(async () => resolvePassword({ error: null }))
    await waitFor(() => expect(signIn.finalize).toHaveBeenCalledTimes(1))
  })
})

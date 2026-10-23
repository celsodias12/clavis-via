import { CLERK_ERROR_CODES, TEST_IDS } from '@clavis-via/shared'
import { useSignUp } from '@clerk/react'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { SignUpScreen } from './sign-up.screen'

type SignUpMock = {
  password: ReturnType<typeof vi.fn>
  finalize: ReturnType<typeof vi.fn>
  status: string
}

const noErrors = { fields: {}, global: null, raw: null }

function mockSignUp(
  signUp: Partial<SignUpMock> = {},
  errors: Record<string, unknown> = noErrors,
): SignUpMock {
  const resource: SignUpMock = {
    password: vi.fn(async () => ({ error: null })),
    finalize: vi.fn(async () => ({ error: null })),
    status: 'complete',
    ...signUp,
  }
  vi.mocked(useSignUp).mockReturnValue({
    signUp: resource,
    errors,
    fetchStatus: 'idle',
  } as unknown as ReturnType<typeof useSignUp>)
  return resource
}

function type(testID: string, value: string) {
  fireEvent.change(screen.getByTestId(testID), { target: { value } })
}

function fillForm() {
  type(TEST_IDS.SIGN_UP_FIRST_NAME, ' Ana ')
  type(TEST_IDS.SIGN_UP_EMAIL, 'Ana@Email.com')
  type(TEST_IDS.SIGN_UP_PASSWORD, '12345678')
}

function submitButton() {
  return screen.getByTestId(TEST_IDS.AUTHENTICATION_SUBMIT)
}

function submitValidForm() {
  fillForm()
  fireEvent.click(submitButton())
}

describe('SignUpScreen', () => {
  it('renders the copy, the three fields and the footer in pt-BR', async () => {
    mockSignUp()
    await renderWithProviders(<SignUpScreen />)

    expect(screen.getByRole('heading', { name: 'Crie sua conta' })).toBeTruthy()
    expect(screen.getByText('Seu caminho começa aqui.')).toBeTruthy()
    expect(screen.getByLabelText('Nome')).toBeTruthy()
    expect(screen.getByPlaceholderText('Como podemos te chamar?')).toBeTruthy()
    expect(screen.getByLabelText('Email')).toBeTruthy()
    expect(screen.getByPlaceholderText('voce@email.com')).toBeTruthy()
    expect(screen.getByLabelText('Senha')).toBeTruthy()
    expect(screen.getByPlaceholderText('Mínimo de 8 caracteres')).toBeTruthy()
    expect(submitButton().textContent).toBe('Criar conta')
    expect(screen.getByText('Já tem uma conta?', { exact: false })).toBeTruthy()
    expect(screen.getByText('Entrar')).toBeTruthy()
  })

  it('gives Clerk the element for its bot protection challenge', async () => {
    mockSignUp()
    await renderWithProviders(<SignUpScreen />)

    expect(document.getElementById('clerk-captcha')).toBeTruthy()
  })

  it('configures the keyboard of each field', async () => {
    mockSignUp()
    await renderWithProviders(<SignUpScreen />)

    const email = screen.getByTestId(TEST_IDS.SIGN_UP_EMAIL)
    expect(email.getAttribute('type')).toBe('email')
    expect(email.getAttribute('autocapitalize')).toBe('none')
    expect(screen.getByTestId(TEST_IDS.SIGN_UP_PASSWORD).getAttribute('type')).toBe('password')
    expect(screen.getByTestId(TEST_IDS.SIGN_UP_FIRST_NAME).getAttribute('autocapitalize')).toBe(
      'words',
    )
  })

  it('shows the three field errors and never calls the sign-up when submitting empty', async () => {
    const signUp = mockSignUp()
    await renderWithProviders(<SignUpScreen />)

    fireEvent.click(submitButton())

    expect(await screen.findByText('Digite seu nome.')).toBeTruthy()
    expect(screen.getByText('Digite um email válido.')).toBeTruthy()
    expect(screen.getByText('A senha precisa ter pelo menos 8 caracteres.')).toBeTruthy()
    expect(signUp.password).not.toHaveBeenCalled()
  })

  it('signs up with the cleaned values and finalizes when the status is complete', async () => {
    const signUp = mockSignUp()
    const { router } = await renderWithProviders(<SignUpScreen />)

    submitValidForm()

    await waitFor(() => expect(signUp.finalize).toHaveBeenCalledTimes(1))
    expect(signUp.password).toHaveBeenCalledTimes(1)
    expect(signUp.password).toHaveBeenCalledWith({
      firstName: 'Ana',
      emailAddress: 'ana@email.com',
      password: '12345678',
    })
    await act(async () => signUp.finalize.mock.calls[0][0].navigate())
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.START))
  })

  it('calls the sign-up once when the button is pressed twice while it is pending', async () => {
    let resolvePassword: (value: { error: null }) => void = () => {}
    const signUp = mockSignUp({
      password: vi.fn(
        () =>
          new Promise<{ error: null }>((resolve) => {
            resolvePassword = resolve
          }),
      ),
    })
    await renderWithProviders(<SignUpScreen />)
    fillForm()

    fireEvent.click(submitButton())
    fireEvent.click(submitButton())
    await waitFor(() => expect(signUp.password).toHaveBeenCalledTimes(1))
    fireEvent.click(submitButton())

    expect(screen.getByTestId(`${TEST_IDS.AUTHENTICATION_SUBMIT}-spinner`)).toBeTruthy()
    await act(async () => resolvePassword({ error: null }))
    await waitFor(() => expect(signUp.finalize).toHaveBeenCalledTimes(1))
    expect(signUp.password).toHaveBeenCalledTimes(1)
  })

  it('shows the email-in-use message under the email field', async () => {
    mockSignUp(
      { password: vi.fn(async () => ({ error: { code: CLERK_ERROR_CODES.IDENTIFIER_EXISTS } })) },
      {
        fields: { emailAddress: { code: CLERK_ERROR_CODES.IDENTIFIER_EXISTS, message: 'taken' } },
        global: null,
        raw: null,
      },
    )
    await renderWithProviders(<SignUpScreen />)

    submitValidForm()

    expect(await screen.findByText('Este email já está em uso.')).toBeTruthy()
    expect(screen.getByTestId(`${TEST_IDS.SIGN_UP_EMAIL}-error`)).toBeTruthy()
  })

  it('maps the first name and password errors to their fields', async () => {
    mockSignUp(
      { password: vi.fn(async () => ({ error: { code: 'form_param_nil' } })) },
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

    submitValidForm()

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
      { password: vi.fn(async () => ({ error: { code: CLERK_ERROR_CODES.TOO_MANY_REQUESTS } })) },
      {
        fields: {},
        global: [{ code: CLERK_ERROR_CODES.TOO_MANY_REQUESTS, message: 'slow down' }],
        raw: null,
      },
    )
    await renderWithProviders(<SignUpScreen />)

    submitValidForm()

    expect(await screen.findByTestId(TEST_IDS.AUTHENTICATION_FORM_ERROR)).toBeTruthy()
    expect(screen.getByText('Muitas tentativas. Tente de novo em alguns minutos.')).toBeTruthy()
  })

  it('shows the generic message above the button when the status is not complete', async () => {
    const signUp = mockSignUp({ status: 'missing_requirements' })
    await renderWithProviders(<SignUpScreen />)

    submitValidForm()

    expect(await screen.findByText('Algo deu errado. Tente de novo.')).toBeTruthy()
    expect(signUp.finalize).not.toHaveBeenCalled()
  })

  it('does not finalize when the sign-up call returns an error', async () => {
    const signUp = mockSignUp({
      password: vi.fn(async () => ({ error: { code: 'form_identifier_exists' } })),
    })
    await renderWithProviders(<SignUpScreen />)

    submitValidForm()

    await waitFor(() => expect(signUp.password).toHaveBeenCalledTimes(1))
    expect(signUp.finalize).not.toHaveBeenCalled()
    expect(screen.queryByTestId(TEST_IDS.AUTHENTICATION_FORM_ERROR)).toBeNull()
  })

  it('shows the generic message when finalize returns an error', async () => {
    mockSignUp({ finalize: vi.fn(async () => ({ error: { code: 'boom' } })) })
    await renderWithProviders(<SignUpScreen />)

    submitValidForm()

    expect(await screen.findByText('Algo deu errado. Tente de novo.')).toBeTruthy()
  })

  it('clears the form error when submitting again', async () => {
    const signUp = mockSignUp({ status: 'missing_requirements' })
    await renderWithProviders(<SignUpScreen />)
    submitValidForm()
    expect(await screen.findByText('Algo deu errado. Tente de novo.')).toBeTruthy()

    signUp.status = 'complete'
    await waitFor(() => expect(submitButton().hasAttribute('disabled')).toBe(false))
    fireEvent.click(submitButton())

    await waitFor(() => expect(signUp.finalize).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('Algo deu errado. Tente de novo.')).toBeNull()
  })

  it('goes back from the arrow and replaces the route with sign in from the footer', async () => {
    mockSignUp()
    const { router } = await renderWithProviders(<SignUpScreen />)
    await act(async () => router.navigate({ to: ROUTES.SIGN_UP }))

    fireEvent.click(screen.getByLabelText('Voltar'))
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.WELCOME))

    await act(async () => router.navigate({ to: ROUTES.SIGN_UP }))
    fireEvent.click(screen.getByText('Entrar'))
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.SIGN_IN))
    await act(async () => router.history.back())
    expect(router.state.location.pathname).toBe(ROUTES.WELCOME)
  })

  it('is one native form, so Enter in any field submits it', async () => {
    const signUp = mockSignUp()
    await renderWithProviders(<SignUpScreen />)
    fillForm()
    const form = screen.getByTestId(TEST_IDS.SIGN_UP_PASSWORD).closest('form') as HTMLFormElement

    expect(screen.getByTestId(TEST_IDS.SIGN_UP_FIRST_NAME).closest('form')).toBe(form)
    expect(screen.getByTestId(TEST_IDS.AUTHENTICATION_SUBMIT).getAttribute('type')).toBe('submit')
    expect(signUp.password).not.toHaveBeenCalled()

    fireEvent.submit(form)

    await waitFor(() => expect(signUp.password).toHaveBeenCalledTimes(1))
  })

  it('ignores a second submit while a request is running', async () => {
    let resolvePassword: (value: { error: null }) => void = () => {}
    const signUp = mockSignUp({
      password: vi.fn(
        () =>
          new Promise<{ error: null }>((resolve) => {
            resolvePassword = resolve
          }),
      ),
    })
    await renderWithProviders(<SignUpScreen />)
    fillForm()
    const form = screen.getByTestId(TEST_IDS.SIGN_UP_PASSWORD).closest('form') as HTMLFormElement
    fireEvent.submit(form)
    await waitFor(() => expect(signUp.password).toHaveBeenCalledTimes(1))

    fireEvent.submit(form)

    expect(signUp.password).toHaveBeenCalledTimes(1)
    await act(async () => resolvePassword({ error: null }))
    await waitFor(() => expect(signUp.finalize).toHaveBeenCalledTimes(1))
  })
})

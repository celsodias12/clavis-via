import { act, renderHook } from '@testing-library/react'
import { useController } from 'react-hook-form'
import { describe, expect, it, vi } from 'vite-plus/test'
import type { ClerkErrorState } from '../../@types/authentication.type'
import { useSignInForm } from './use-sign-in-form'

type SignInField = 'identifier' | 'password'

const NO_ERRORS: ClerkErrorState<SignInField> = { fields: {}, global: null }
const INVALID_CREDENTIALS_KEY = 'screen.authentication.errors.invalidCredentials'
const GENERIC_KEY = 'screen.authentication.errors.generic'

function setup(errors: ClerkErrorState<SignInField> = NO_ERRORS, hasFailureHandler = true) {
  const finalize = vi.fn(async ({ navigate }: { navigate: () => void }) => {
    navigate()
    return { error: null }
  })
  const attempt = {
    status: 'complete' as string | null,
    finalize,
    password: vi.fn(async (_values: unknown): Promise<{ error: unknown }> => ({ error: null })),
  }
  const navigate = vi.fn()
  const onFailure = vi.fn()
  const rendered = renderHook(
    (currentErrors: ClerkErrorState<SignInField>) => {
      const form = useSignInForm({
        attempt,
        errors: currentErrors,
        navigate,
        onFailure: hasFailureHandler ? onFailure : undefined,
      })
      const email = useController({ control: form.control, name: 'emailAddress' })
      const password = useController({ control: form.control, name: 'password' })
      return { form, email, password }
    },
    { initialProps: errors },
  )

  const fill = async () => {
    await act(async () => rendered.result.current.email.field.onChange('ana@example.com'))
    await act(async () => rendered.result.current.password.field.onChange('secret'))
  }
  const submit = () => act(async () => rendered.result.current.form.submit())

  return { ...rendered, attempt, navigate, onFailure, fill, submit }
}

describe('useSignInForm', () => {
  it('signs in with the validated values and leaves the screen', async () => {
    const { result, attempt, navigate, onFailure, fill, submit } = setup()
    await fill()

    await submit()

    expect(attempt.password).toHaveBeenCalledWith({
      emailAddress: 'ana@example.com',
      password: 'secret',
    })
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(onFailure).not.toHaveBeenCalled()
    expect(result.current.form.formErrorKey).toBeUndefined()
    expect(result.current.form.isSubmitting).toBe(false)
  })

  it('does not send an invalid form and reports the failure', async () => {
    const { attempt, onFailure, submit } = setup()

    await submit()

    expect(attempt.password).not.toHaveBeenCalled()
    expect(onFailure).toHaveBeenCalledTimes(1)
  })

  it('does not need a failure handler', async () => {
    const { attempt, fill, submit } = setup(
      { fields: { password: { code: 'form_password_incorrect' } }, global: null },
      false,
    )
    attempt.password.mockResolvedValue({ error: new Error('rejected') })
    await fill()

    await expect(submit()).resolves.toBeUndefined()
  })

  it('ignores the Clerk errors of an earlier visit until a request is sent', async () => {
    const { result, attempt, onFailure, fill, submit } = setup({
      fields: { password: { code: 'form_password_incorrect' } },
      global: null,
    })
    attempt.password.mockResolvedValue({ error: new Error('rejected') })
    expect(result.current.form.formErrorKey).toBeUndefined()
    await fill()

    await submit()

    expect(onFailure).toHaveBeenCalledTimes(1)
    expect(result.current.form.formErrorKey).toBe(INVALID_CREDENTIALS_KEY)
  })

  it.each([
    [
      'the identifier',
      { fields: { identifier: { code: 'form_identifier_not_found' } }, global: null },
    ],
    ['the password', { fields: { password: { code: 'form_password_incorrect' } }, global: null }],
  ] as const)('shows one error above the button for %s', async (_name, errors) => {
    const { result, attempt, fill, submit } = setup(errors)
    attempt.password.mockResolvedValue({ error: new Error('rejected') })
    await fill()

    await submit()

    expect(result.current.form.formErrorKey).toBe(INVALID_CREDENTIALS_KEY)
  })

  it('shows the first global error', async () => {
    const { result, attempt, fill, submit } = setup({
      fields: {},
      global: [{ code: 'something_else' }],
    })
    attempt.password.mockResolvedValue({ error: new Error('rejected') })
    await fill()

    await submit()

    expect(result.current.form.formErrorKey).toBe(GENERIC_KEY)
  })

  it('shows the generic error when the attempt cannot be finalized', async () => {
    const { result, attempt, navigate, fill, submit } = setup()
    attempt.status = 'needs_second_factor'
    await fill()

    await submit()

    expect(navigate).not.toHaveBeenCalled()
    expect(result.current.form.formErrorKey).toBe(GENERIC_KEY)
  })
})

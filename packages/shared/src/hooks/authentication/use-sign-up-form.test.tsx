import { act, renderHook } from '@testing-library/react'
import { useController } from 'react-hook-form'
import { describe, expect, it, vi } from 'vite-plus/test'
import type { ClerkErrorState, SignUpFormInput } from '../../@types/authentication.type'
import { useSignUpForm } from './use-sign-up-form'

const NO_ERRORS: ClerkErrorState<keyof SignUpFormInput> = { fields: {}, global: null }
const EMAIL_IN_USE_KEY = 'screen.authentication.errors.emailInUse'
const GENERIC_KEY = 'screen.authentication.errors.generic'

function setup(errors: ClerkErrorState<keyof SignUpFormInput> = NO_ERRORS) {
  const attempt = {
    status: 'complete' as string | null,
    finalize: vi.fn(async ({ navigate }: { navigate: () => void }) => {
      navigate()
      return { error: null }
    }),
    password: vi.fn(async (_values: unknown): Promise<{ error: unknown }> => ({ error: null })),
  }
  const navigate = vi.fn()
  const onFailure = vi.fn()
  const rendered = renderHook(
    (currentErrors: ClerkErrorState<keyof SignUpFormInput>) => {
      const form = useSignUpForm({ attempt, errors: currentErrors, navigate, onFailure })
      const firstName = useController({ control: form.control, name: 'firstName' })
      const email = useController({ control: form.control, name: 'emailAddress' })
      const password = useController({ control: form.control, name: 'password' })
      // Read during the render: the field state only subscribes to what a render reads.
      const fieldErrors = {
        firstName: firstName.fieldState.error?.message,
        emailAddress: email.fieldState.error?.message,
      }
      return { form, firstName, email, password, fieldErrors }
    },
    { initialProps: errors },
  )

  const fill = async () => {
    await act(async () => rendered.result.current.firstName.field.onChange('Ana'))
    await act(async () => rendered.result.current.email.field.onChange('ana@example.com'))
    await act(async () => rendered.result.current.password.field.onChange('secret-123'))
  }
  const submit = () => act(async () => rendered.result.current.form.submit())

  return { ...rendered, attempt, navigate, onFailure, fill, submit }
}

describe('useSignUpForm', () => {
  it('signs up with the validated values and leaves the screen', async () => {
    const { result, attempt, navigate, onFailure, fill, submit } = setup()
    await fill()

    await submit()

    expect(attempt.password).toHaveBeenCalledWith({
      firstName: 'Ana',
      emailAddress: 'ana@example.com',
      password: 'secret-123',
    })
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(onFailure).not.toHaveBeenCalled()
    expect(result.current.form.formErrorKey).toBeUndefined()
  })

  it('does not send an invalid form and reports the failure', async () => {
    const { attempt, onFailure, submit } = setup()

    await submit()

    expect(attempt.password).not.toHaveBeenCalled()
    expect(onFailure).toHaveBeenCalledTimes(1)
  })

  it('puts the Clerk error of a field under that field once a request was sent', async () => {
    const { result, attempt, rerender, fill, submit } = setup()
    attempt.password.mockResolvedValue({ error: new Error('rejected') })
    await fill()
    await submit()

    await act(async () =>
      rerender({
        fields: { emailAddress: { code: 'form_identifier_exists' }, firstName: null },
        global: null,
      }),
    )

    expect(result.current.fieldErrors.emailAddress).toBe(EMAIL_IN_USE_KEY)
    expect(result.current.fieldErrors.firstName).toBeUndefined()
    expect(result.current.form.formErrorKey).toBeUndefined()
  })

  it('ignores the Clerk errors of an earlier visit until a request is sent', () => {
    const { result } = setup({
      fields: { emailAddress: { code: 'form_identifier_exists' } },
      global: [{ code: 'something_else' }],
    })

    expect(result.current.fieldErrors.emailAddress).toBeUndefined()
    expect(result.current.form.formErrorKey).toBeUndefined()
  })

  it('shows the first global error above the button', async () => {
    const { result, attempt, rerender, fill, submit } = setup()
    attempt.password.mockResolvedValue({ error: new Error('rejected') })
    await fill()
    await submit()

    rerender({ fields: {}, global: [{ code: 'something_else' }] })

    expect(result.current.form.formErrorKey).toBe(GENERIC_KEY)
  })

  it('shows the generic error when the attempt cannot be finalized', async () => {
    const { result, attempt, navigate, fill, submit } = setup()
    attempt.status = null
    await fill()

    await submit()

    expect(navigate).not.toHaveBeenCalled()
    expect(result.current.form.formErrorKey).toBe(GENERIC_KEY)
  })

  it('has no global error to show when Clerk reports none', async () => {
    const { result, attempt, rerender, fill, submit } = setup()
    attempt.password.mockResolvedValue({ error: new Error('rejected') })
    await fill()
    await submit()

    rerender({ fields: {}, global: undefined })

    expect(result.current.form.formErrorKey).toBeUndefined()
  })
})

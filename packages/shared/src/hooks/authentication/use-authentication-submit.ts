import { useState } from 'react'
import type { FieldValues, UseFormHandleSubmit } from 'react-hook-form'
import type { PasswordAttempt } from '../../@types/authentication.type'
import { useAuthenticationCompletion } from './use-authentication-completion'

type AuthenticationSubmitOptions<
  TInput extends FieldValues,
  TValues extends FieldValues,
> = Readonly<{
  handleSubmit: UseFormHandleSubmit<TInput, TValues>
  attempt: PasswordAttempt<TValues>
  navigate: () => void
  onFailure?: () => void
}>

// The submit shared by the sign in and sign up forms: sends the validated values to the Clerk attempt, finalizes
// it when the request succeeds and calls `onFailure` when the form is invalid or the request fails.
// `hasRequested` stays false until the form sends a request: the Clerk state outlives the screen, so errors
// from an earlier visit must be ignored until then.
export function useAuthenticationSubmit<TInput extends FieldValues, TValues extends FieldValues>({
  handleSubmit,
  attempt,
  navigate,
  onFailure,
}: AuthenticationSubmitOptions<TInput, TValues>) {
  const { completionErrorKey, resetCompletionError, complete } =
    useAuthenticationCompletion(navigate)

  const [hasRequested, setHasRequested] = useState(false)

  const submit = handleSubmit(async (values) => {
    resetCompletionError()
    const { error } = await attempt.password(values)
    setHasRequested(true)
    if (error) {
      onFailure?.()
      return
    }
    await complete(attempt)
  }, onFailure)

  return { submit, hasRequested, completionErrorKey }
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type {
  AuthenticationFormOptions,
  SignInFormInput,
  SignInFormValues,
} from '../../@types/authentication.type'
import { translationKeyForClerkError } from '../../utils/clerk-errors'
import { signInFormSchema } from '../../validation/authentication.schema'
import { useAuthenticationSubmit } from './use-authentication-submit'

type SignInField = 'identifier' | 'password'

// The state of the sign in form, without any platform piece: fields, validation, submit and the error shown
// above the button. Credential errors are shown once there, never under a field, so the screen does not reveal
// whether the email or the password was wrong.
export function useSignInForm({
  attempt,
  errors,
  navigate,
  onFailure,
}: AuthenticationFormOptions<SignInFormValues, SignInField>) {
  const {
    control,
    handleSubmit,
    setFocus,
    formState: { isSubmitting },
  } = useForm<SignInFormInput, unknown, SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: { emailAddress: '', password: '' },
  })
  const { submit, hasRequested, completionErrorKey } = useAuthenticationSubmit({
    handleSubmit,
    attempt,
    navigate,
    onFailure,
  })

  const clerkError = hasRequested
    ? (errors.fields.identifier ?? errors.fields.password ?? errors.global?.[0])
    : undefined
  const formErrorKey =
    completionErrorKey ?? (clerkError ? translationKeyForClerkError(clerkError.code) : undefined)

  return { control, setFocus, submit, isSubmitting, formErrorKey }
}

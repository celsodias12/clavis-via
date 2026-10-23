import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type {
  AuthenticationFormOptions,
  SignUpFormInput,
  SignUpFormValues,
} from '../../@types/authentication.type'
import { SIGN_UP_FIELDS } from '../../constants/authentication.constant'
import { translationKeyForClerkError } from '../../utils/clerk-errors'
import { signUpFormSchema } from '../../validation/authentication.schema'
import { useAuthenticationSubmit } from './use-authentication-submit'

// The state of the sign up form, without any platform piece: fields, validation, submit, the errors Clerk
// reports under each field and the one shown above the button.
export function useSignUpForm({
  attempt,
  errors,
  navigate,
  onFailure,
}: AuthenticationFormOptions<SignUpFormValues, keyof SignUpFormInput>) {
  const {
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { isSubmitting },
  } = useForm<SignUpFormInput, unknown, SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: { firstName: '', emailAddress: '', password: '' },
  })
  const { submit, hasRequested, completionErrorKey } = useAuthenticationSubmit({
    handleSubmit,
    attempt,
    navigate,
    onFailure,
  })

  // Clerk reports field and global errors through the hook state after the request settles.
  useEffect(() => {
    if (!hasRequested) {
      return
    }
    for (const field of SIGN_UP_FIELDS) {
      const fieldError = errors.fields[field]
      if (fieldError) {
        setError(field, { message: translationKeyForClerkError(fieldError.code) })
      }
    }
  }, [errors, hasRequested, setError])

  const [globalError] = hasRequested ? (errors.global ?? []) : []
  const formErrorKey =
    completionErrorKey ?? (globalError ? translationKeyForClerkError(globalError.code) : undefined)

  return { control, setFocus, submit, isSubmitting, formErrorKey }
}

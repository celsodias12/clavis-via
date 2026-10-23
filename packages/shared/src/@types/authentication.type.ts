import type { z } from 'zod'
import type { signInFormSchema, signUpFormSchema } from '../validation/authentication.schema'

export type SignUpFormInput = z.input<typeof signUpFormSchema>
export type SignUpFormValues = z.output<typeof signUpFormSchema>
export type SignInFormInput = z.input<typeof signInFormSchema>
export type SignInFormValues = z.output<typeof signInFormSchema>

// The part of a Clerk sign-in / sign-up attempt that the completion step needs.
export type FinalizableAttempt = Readonly<{
  status: string | null
  finalize: (parameters: { navigate: () => void }) => Promise<{ error: unknown }>
}>

// The error of one Clerk field, as far as the forms read it.
export type ClerkFieldError = Readonly<{ code: string }>

// The errors a Clerk sign-in / sign-up hook reports after a request settles.
export type ClerkErrorState<TField extends string> = Readonly<{
  fields: Readonly<Partial<Record<TField, ClerkFieldError | null | undefined>>>
  global: readonly ClerkFieldError[] | null | undefined
}>

// A Clerk attempt that can be sent with email and password and then finalized.
export type PasswordAttempt<TValues> = FinalizableAttempt &
  Readonly<{ password: (values: TValues) => Promise<{ error: unknown }> }>

// What the platform gives the sign in / sign up form hooks: the Clerk attempt and its errors, how to leave
// the screen once the attempt is finalized, and what to do when a submit fails (the app dismisses the keyboard).
export type AuthenticationFormOptions<TValues, TField extends string> = Readonly<{
  attempt: PasswordAttempt<TValues>
  errors: ClerkErrorState<TField>
  navigate: () => void
  onFailure?: () => void
}>

import { useState } from 'react'
import type { FinalizableAttempt } from '../../@types/authentication.type'
import { CLERK_ATTEMPT_STATUS, CLERK_GENERIC_ERROR_KEY } from '../../constants/clerk-error.constant'
import type { TranslationKeys } from '../../i18n/types'

// Shared last step of sign in and sign up: finalizes a completed Clerk attempt and calls `navigate` to go to
// the start route, or keeps a generic error key when the attempt cannot be finalized.
export function useAuthenticationCompletion(navigate: () => void) {
  const [completionErrorKey, setCompletionErrorKey] = useState<TranslationKeys | undefined>()

  const resetCompletionError = () => setCompletionErrorKey(undefined)

  const complete = async (attempt: FinalizableAttempt) => {
    if (attempt.status !== CLERK_ATTEMPT_STATUS.COMPLETE) {
      setCompletionErrorKey(CLERK_GENERIC_ERROR_KEY)
      return
    }
    const { error } = await attempt.finalize({ navigate })
    if (error) {
      setCompletionErrorKey(CLERK_GENERIC_ERROR_KEY)
    }
  }

  return { completionErrorKey, resetCompletionError, complete }
}

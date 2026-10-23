import { useClerk } from '@clerk/react'
import { useEffect, useState } from 'react'
import {
  CLERK_LOAD_TIMEOUT_MILLISECONDS,
  CLERK_STATUS_ERROR,
} from '../../constants/authentication.constant'

// True when Clerk will not finish loading: its script failed (status "error", for example offline or blocked by an
// extension) or it is taking longer than the timeout. Without it the splash would spin forever.
export function useClerkLoadFailure(isLoaded: boolean) {
  const { status } = useClerk()

  const [hasTimedOut, setHasTimedOut] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      return
    }
    const timer = setTimeout(() => setHasTimedOut(true), CLERK_LOAD_TIMEOUT_MILLISECONDS)
    return () => clearTimeout(timer)
  }, [isLoaded])

  return !isLoaded && (status === CLERK_STATUS_ERROR || hasTimedOut)
}

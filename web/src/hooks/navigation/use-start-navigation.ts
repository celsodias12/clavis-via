import { useRouter } from '@tanstack/react-router'
import { ROUTES } from '../../constants/route.constant'

// Where sign in and sign up go once the Clerk attempt is finalized: the start route, replacing the entry.
export function useStartNavigation(): () => void {
  const router = useRouter()

  return () => {
    router.navigate({ to: ROUTES.START, replace: true })
  }
}

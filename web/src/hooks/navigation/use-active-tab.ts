import { useRouterState } from '@tanstack/react-router'
import { TAB_ROUTES } from '../../constants/route.constant'

// The route name of the tab whose screen is open, or undefined elsewhere (the tab routes have no children).
export function useActiveTab() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return Object.entries(TAB_ROUTES).find(([, route]) => route === pathname)?.[0]
}

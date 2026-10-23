import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useFocusPageHeading } from '@/hooks/navigation/use-focus-page-heading'
import { NotFoundScreen } from '@/screens/not-found/not-found.screen'

function RootRoute() {
  useFocusPageHeading()

  return <Outlet />
}

export const Route = createRootRoute({
  component: RootRoute,
  notFoundComponent: NotFoundScreen,
})

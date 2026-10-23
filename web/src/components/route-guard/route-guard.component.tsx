import { useAuth } from '@clerk/react'
import { Navigate, Outlet } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants/route.constant'
import { useClerkLoadFailure } from '../../hooks/session/use-clerk-load-failure'
import { AppShell } from '../app-shell/app-shell.component'
import { BrandSplash } from '../brand-splash/brand-splash.component'
import { ErrorState } from '../error-state/error-state.component'

// What the guards show while Clerk has not loaded: the splash, or, when Clerk cannot load at all, a message with
// a retry that reloads the page.
function ClerkLoading() {
  const { t } = useTranslation()
  const { isLoaded } = useAuth()
  const hasFailed = useClerkLoadFailure(isLoaded)

  if (!hasFailed) {
    return <BrandSplash />
  }

  return (
    <main className="flex min-h-svh items-center justify-center">
      <ErrorState
        message={t('common.loadError')}
        onRetry={() => window.location.reload()}
        isRetrying={false}
      />
    </main>
  )
}

// Public routes (entry, sign in, sign up): waits for Clerk to restore the session, then sends a signed in
// user on to /start.
export function PublicRouteGuard() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return <ClerkLoading />
  }

  return isSignedIn ? <Navigate to={ROUTES.START} replace /> : <Outlet />
}

// Private routes: waits for Clerk to restore the session, then sends a signed out visitor to the entry
// screen; a signed in user sees the screen inside the shell.
export function PrivateRouteGuard() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return <ClerkLoading />
  }

  return isSignedIn ? (
    <AppShell>
      <Outlet />
    </AppShell>
  ) : (
    <Navigate to={ROUTES.WELCOME} replace />
  )
}

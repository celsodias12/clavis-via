import { TimeProviderContext } from '@clavis-via/shared'
import { ClerkProvider } from '@clerk/react'
import type { ReactNode } from 'react'
import { clerkConfig } from '../configs/clerk.config'
import { router } from '../configs/router.config'
import { subscribeToWindowForeground } from '../services/time/foreground.service'
import { ApiProviderContext } from './api'

// Clerk navigates (after sign out, when the session expires) through the app's router, so these moves are
// client-side history changes, not full page loads.
const routerPush = (to: string) => router.history.push(to)
const routerReplace = (to: string) => router.history.replace(to)

type ContextProvidersProps = Readonly<{ children: ReactNode }>

export function ContextProviders({ children }: ContextProvidersProps) {
  return (
    <ClerkProvider
      publishableKey={clerkConfig.publishableKey}
      routerPush={routerPush}
      routerReplace={routerReplace}
    >
      <TimeProviderContext subscribeToForeground={subscribeToWindowForeground}>
        <ApiProviderContext>{children}</ApiProviderContext>
      </TimeProviderContext>
    </ClerkProvider>
  )
}

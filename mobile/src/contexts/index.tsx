import { TimeProviderContext } from '@clavis-via/shared'
import { ClerkProvider } from '@clerk/expo'
import type { ReactNode } from 'react'
import { clerkConfig } from '../configs/clerk.config'
import { useDeviceLanguage } from '../hooks/locale/use-device-language'
import { useQueryFocus } from '../hooks/session/use-query-focus'
import { subscribeToAppForeground } from '../services/time/foreground.service'
import { ApiProviderContext } from './api'

type ContextProvidersProps = Readonly<{ children: ReactNode }>

export function ContextProviders({ children }: ContextProvidersProps) {
  useDeviceLanguage()
  useQueryFocus()

  return (
    <ClerkProvider publishableKey={clerkConfig.publishableKey} tokenCache={clerkConfig.tokenCache}>
      <TimeProviderContext subscribeToForeground={subscribeToAppForeground}>
        <ApiProviderContext>{children}</ApiProviderContext>
      </TimeProviderContext>
    </ClerkProvider>
  )
}

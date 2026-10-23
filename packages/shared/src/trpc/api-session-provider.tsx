import { QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react'
import type { ApiClientOptions } from '../@types/api.type'
import type { SupportedLanguage } from '../@types/language.type'
import { createQueryClient } from './query-client.service'
import { createApiClient, TRPCProvider } from './trpc.service'

type ApiSessionProviderProps = Readonly<{
  children: ReactNode
  baseUrl: string
  getToken: ApiClientOptions['getToken']
  language?: SupportedLanguage
  onUnauthorized: () => unknown
}>

// The platform keys this entire subtree by auth session. Pending operations keep the retired clients,
// never the next session's cache or observers. Retirement happens in layout cleanup, before another
// session can commit and release a pending response.
export function ApiSessionProviderContext({
  children,
  baseUrl,
  getToken,
  language,
  onUnauthorized,
}: ApiSessionProviderProps) {
  const isActive = useRef(true)
  const callbacks = useRef({ getToken, onUnauthorized })

  useLayoutEffect(() => {
    callbacks.current = { getToken, onUnauthorized }
  }, [getToken, onUnauthorized])

  const [queryClient] = useState(() =>
    createQueryClient(() => (isActive.current ? callbacks.current.onUnauthorized() : undefined)),
  )
  const [apiClient] = useState(() =>
    createApiClient({
      baseUrl,
      language,
      async getToken() {
        if (!isActive.current) {
          return null
        }
        const token = await callbacks.current.getToken()
        return isActive.current ? token : null
      },
    }),
  )

  useLayoutEffect(() => {
    isActive.current = true
    return () => {
      isActive.current = false
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={apiClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}

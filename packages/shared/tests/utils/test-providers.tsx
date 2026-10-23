import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { SubscribeToForeground } from '../../src/@types/time.type'
import { TimeProviderContext } from '../../src/time/time-provider'
import { createApiClient, TRPCProvider } from '../../src/trpc/trpc.service'
import { TEST_API_BASE_URL } from './test-constants'

// A foreground adapter that never fires; tests that need it pass their own.
const NEVER_IN_FOREGROUND = () => () => {}

type TestProvidersOptions = { subscribeToForeground?: SubscribeToForeground }

// The platform-independent part of renderWithProviders: a QueryClient without retries, a tRPC client pointed at
// the MSW-mocked test API and the clock. Each platform wraps `TestProviders` with its own renderer and extras
// (i18n, router).
export function createTestProviders(options?: TestProvidersOptions) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const apiClient = createApiClient({ baseUrl: TEST_API_BASE_URL, getToken: async () => null })

  function TestProviders({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <TimeProviderContext
        subscribeToForeground={options?.subscribeToForeground ?? NEVER_IN_FOREGROUND}
      >
        <QueryClientProvider client={queryClient}>
          <TRPCProvider trpcClient={apiClient} queryClient={queryClient}>
            {children}
          </TRPCProvider>
        </QueryClientProvider>
      </TimeProviderContext>
    )
  }

  return { queryClient, TestProviders }
}

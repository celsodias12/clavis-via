import { createTestProviders } from '@clavis-via/shared/testing'
import { type RenderOptions, render } from '@testing-library/react-native'
import type { ReactElement, ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '../../src/i18n/config'
import { subscribeToAppForeground } from '../../src/services/time/foreground.service'

// Renders `ui` inside the shared test providers (QueryClient without retries, tRPC client pointed at the
// MSW-mocked test API, clock) plus the app's i18n.
export async function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const { queryClient, TestProviders } = createTestProviders({
    subscribeToForeground: subscribeToAppForeground,
  })

  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <I18nextProvider i18n={i18n}>
        <TestProviders>{children}</TestProviders>
      </I18nextProvider>
    )
  }

  const result = await render(ui, { ...options, wrapper: Wrapper })
  return { ...result, queryClient }
}

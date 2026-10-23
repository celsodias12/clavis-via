import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { createI18n } from '../../src/i18n/config'
import { createTestProviders } from './test-providers'

// Renders a hook inside the shared test providers plus the pt-BR i18n, which the data hooks that translate
// need. Returns the i18n instance so a test can compare against the real texts.
export function renderHookWithProviders<TResult>(hook: () => TResult) {
  const { queryClient, TestProviders } = createTestProviders()
  const i18n = createI18n('pt-BR')

  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <I18nextProvider i18n={i18n}>
        <TestProviders>{children}</TestProviders>
      </I18nextProvider>
    )
  }

  return { i18n, queryClient, ...renderHook(hook, { wrapper: Wrapper }) }
}

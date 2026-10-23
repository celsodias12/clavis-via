import { type RenderOptions, render } from '@testing-library/react'
import type { ReactElement } from 'react'
import type { SubscribeToForeground } from '../../src/@types/time.type'
import { createTestProviders } from './test-providers'

// Renders `ui` inside the shared test providers (see createTestProviders).
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { subscribeToForeground?: SubscribeToForeground },
) {
  const { queryClient, TestProviders } = createTestProviders(options)
  const result = render(ui, { ...options, wrapper: TestProviders })
  return { ...result, queryClient }
}

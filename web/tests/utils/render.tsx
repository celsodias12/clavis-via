import { createTestProviders } from '@clavis-via/shared/testing'
import {
  type AnyRoute,
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { type RenderOptions, render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '../../src/configs/i18n.config'
import { createAppRouter } from '../../src/configs/router.config'
import { subscribeToWindowForeground } from '../../src/services/time/foreground.service'

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & { route?: string }

const INITIAL_ROUTE = '/'

type AppRouter = ReturnType<typeof createAppRouter>

// Mounts `router` inside the shared test providers (QueryClient without retries, tRPC client pointed at the
// MSW-mocked test API, clock) plus the app's i18n (pt-BR in tests). The router is loaded before rendering, so
// the matched screen is on screen when this resolves.
async function renderRouter<TRouter extends AppRouter>(
  router: TRouter,
  options: Omit<RenderOptions, 'wrapper'>,
) {
  const { queryClient, TestProviders } = createTestProviders({
    subscribeToForeground: subscribeToWindowForeground,
  })
  await router.load()

  const result = render(
    <I18nextProvider i18n={i18n}>
      <TestProviders>
        <RouterProvider router={router} />
      </TestProviders>
    </I18nextProvider>,
    options,
  )
  return { ...result, queryClient, router }
}

// Renders `ui` as the content of an in-memory router at `route`.
export async function renderWithProviders(
  ui: ReactElement,
  { route = INITIAL_ROUTE, ...options }: RenderWithProvidersOptions = {},
) {
  const rootRoute = createRootRoute({ component: () => ui, notFoundComponent: () => ui })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [route] }),
  })
  return renderRouter(router as unknown as AppRouter, options)
}

// Renders a route tree of the test's own (for example a guard around one page) at `route`.
export async function renderRoutes(
  routeTree: AnyRoute,
  { route = INITIAL_ROUTE, ...options }: RenderWithProvidersOptions = {},
) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [route] }),
  })
  return renderRouter(router as unknown as AppRouter, options)
}

// Renders the real route tree (guards, shell and screens) at `route`.
export async function renderApp({
  route = INITIAL_ROUTE,
  ...options
}: RenderWithProvidersOptions = {}) {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [route] }))
  return renderRouter(router, options)
}

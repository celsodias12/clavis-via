import { TEST_IDS } from '@clavis-via/shared'
import { createRootRoute, createRoute } from '@tanstack/react-router'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { clerkMock } from '../../../tests/utils/clerk-mock'
import { renderRoutes } from '../../../tests/utils/render'
import { CLERK_LOAD_TIMEOUT_MILLISECONDS } from '../../constants/authentication.constant'
import { ROUTES } from '../../constants/route.constant'
import { PrivateRouteGuard, PublicRouteGuard } from './route-guard.component'

// A guard around one page, the way the route tree wires them.
function guardedTree(Guard: () => ReactElement) {
  const root = createRootRoute()
  const guarded = createRoute({ getParentRoute: () => root, id: 'guarded', component: Guard })
  const page = createRoute({
    getParentRoute: () => guarded,
    path: ROUTES.HOME,
    component: () => <p>page</p>,
  })
  const welcome = createRoute({
    getParentRoute: () => root,
    path: ROUTES.WELCOME,
    component: () => <p>welcome</p>,
  })
  const start = createRoute({
    getParentRoute: () => root,
    path: ROUTES.START,
    component: () => <p>start</p>,
  })
  return root.addChildren([guarded.addChildren([page]), welcome, start])
}

function notLoaded() {
  clerkMock.state = { isLoaded: false, isSignedIn: false }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('PrivateRouteGuard', () => {
  it('shows the splash while Clerk loads, then the screen inside the shell', async () => {
    notLoaded()
    await renderRoutes(guardedTree(PrivateRouteGuard), { route: ROUTES.HOME })
    expect(screen.getByTestId(TEST_IDS.BRAND_KEY)).toBeTruthy()

    act(() => clerkMock.setState({ isLoaded: true, isSignedIn: true, userId: 'user-1' }))

    await waitFor(() => expect(screen.getByTestId(TEST_IDS.SIDE_NAVIGATION)).toBeTruthy())
    expect(screen.getByText('page')).toBeTruthy()
  })

  it('sends a signed out visitor to the entry page', async () => {
    const { router } = await renderRoutes(guardedTree(PrivateRouteGuard), { route: ROUTES.HOME })

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.WELCOME))
    expect(screen.getByText('welcome')).toBeTruthy()
  })

  it('offers a retry that reloads the page when Clerk reports that its script failed', async () => {
    notLoaded()
    clerkMock.status = 'error'
    const reload = vi.fn()
    vi.stubGlobal('location', { ...window.location, reload })
    await renderRoutes(guardedTree(PrivateRouteGuard), { route: ROUTES.HOME })

    expect(screen.queryByTestId(TEST_IDS.BRAND_KEY)).toBeNull()
    fireEvent.click(screen.getByTestId(TEST_IDS.ERROR_STATE_RETRY))

    expect(reload).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
  })

  it('offers the retry too when Clerk takes longer than the timeout', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    notLoaded()
    await renderRoutes(guardedTree(PrivateRouteGuard), { route: ROUTES.HOME })
    expect(screen.getByTestId(TEST_IDS.BRAND_KEY)).toBeTruthy()

    await act(async () => vi.advanceTimersByTime(CLERK_LOAD_TIMEOUT_MILLISECONDS))

    expect(screen.getByTestId(TEST_IDS.ERROR_STATE)).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.BRAND_KEY)).toBeNull()
  })
})

describe('PublicRouteGuard', () => {
  it('shows the screen of a visitor who is not signed in', async () => {
    await renderRoutes(guardedTree(PublicRouteGuard), { route: ROUTES.HOME })

    expect(screen.queryByTestId(TEST_IDS.BRAND_KEY)).toBeNull()
  })

  it('sends a signed in user on to /start', async () => {
    clerkMock.state = { isLoaded: true, isSignedIn: true, userId: 'user-1' }
    const { router } = await renderRoutes(guardedTree(PublicRouteGuard), { route: ROUTES.HOME })

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.START))
  })

  it('shows the splash while Clerk loads and the retry when it never does', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    notLoaded()
    await renderRoutes(guardedTree(PublicRouteGuard), { route: ROUTES.HOME })
    expect(screen.getByTestId(TEST_IDS.BRAND_KEY)).toBeTruthy()

    await act(async () => vi.advanceTimersByTime(CLERK_LOAD_TIMEOUT_MILLISECONDS))

    expect(screen.getByTestId(TEST_IDS.ERROR_STATE_RETRY)).toBeTruthy()
  })
})

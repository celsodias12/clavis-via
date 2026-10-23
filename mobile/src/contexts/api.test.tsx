import { useApi } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { useAuth } from '@clerk/expo'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react-native'
import { HttpResponse, http } from 'msw/http'
import type { ReactNode } from 'react'
import { AppState, type AppStateStatus, Text } from 'react-native'
import { clerkMock } from '../../tests/utils/clerk-mock'
import { i18n } from '../i18n/config'
import { ContextProviders } from './index'

jest.mock('@clerk/expo', () => require('../../tests/utils/clerk-mock').clerkModule)
jest.mock('@clerk/expo/token-cache', () => require('../../tests/utils/clerk-mock').tokenCacheModule)

function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return <ContextProviders>{children}</ContextProviders>
}

function useLatestCheckIn() {
  const api = useApi()
  return useQuery(
    api.checkIn.latestForDate.queryOptions({ localDate: '2026-10-19' }, { retry: false }),
  )
}

beforeEach(() => clerkMock.reset())

describe('ApiProviderContext', () => {
  it('refreshes stale same-day data when the app returns to the foreground', async () => {
    const listeners = new Set<(status: AppStateStatus) => void>()
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
      listeners.add(listener)
      return { remove: () => listeners.delete(listener) }
    })
    const now = Date.now()
    const clock = jest.spyOn(Date, 'now').mockReturnValue(now)
    let checkIn: { id: string } | null = null
    server.use(mockQuery('checkIn.latestForDate', () => checkIn))

    try {
      const { result } = await renderHook(useLatestCheckIn, { wrapper: Wrapper })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toBeNull()

      await act(async () => {
        for (const listener of listeners) listener('background')
      })
      checkIn = { id: 'created-on-web' }
      clock.mockReturnValue(now + 60_000)
      await act(async () => {
        for (const listener of listeners) listener('active')
      })

      await waitFor(() => expect(result.current.data).toEqual(checkIn))
    } finally {
      jest.restoreAllMocks()
    }
  })

  it('serves tRPC queries through the Clerk session token', async () => {
    clerkMock.state = { isLoaded: true, isSignedIn: true, sessionId: 'session_a' }
    clerkMock.getToken.mockResolvedValue('session-token')
    server.use(mockQuery('checkIn.latestForDate', () => null))

    const { result } = await renderHook(useLatestCheckIn, { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(clerkMock.getToken).toHaveBeenCalled()
  })

  it('signs the user out when the API rejects the session', async () => {
    clerkMock.state = { isLoaded: true, isSignedIn: true, sessionId: 'session_a' }
    server.use(mockTrpcError('checkIn.latestForDate', 'UNAUTHORIZED', 401))

    const { result } = await renderHook(useLatestCheckIn, { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(clerkMock.endSession).toHaveBeenCalledWith('session_a')
  })

  it('keeps an already-started unauthorized action bound to its original session', async () => {
    clerkMock.state = { isLoaded: true, isSignedIn: true, sessionId: 'session_a' }
    let release = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const removedSessions: (string | null | undefined)[] = []
    let started = false
    clerkMock.signOut.mockImplementation(async () => {
      started = true
      await gate
      removedSessions.push(clerkMock.state.sessionId)
    })
    clerkMock.endSession.mockImplementation(async (sessionId) => {
      started = true
      await gate
      removedSessions.push(sessionId)
    })
    server.use(mockTrpcError('checkIn.latestForDate', 'UNAUTHORIZED', 401))
    await renderHook(useLatestCheckIn, { wrapper: Wrapper })
    await waitFor(() => expect(started).toBe(true))

    server.use(mockQuery('checkIn.latestForDate', () => null))
    await act(async () => {
      clerkMock.setState({ isLoaded: true, isSignedIn: true, sessionId: 'session_b' })
    })
    await act(async () => {
      release()
      await gate
    })

    expect(removedSessions).toEqual(['session_a'])
    expect(clerkMock.signOut).not.toHaveBeenCalled()
  })

  it('does not end any session for an unauthenticated request', async () => {
    server.use(mockTrpcError('checkIn.latestForDate', 'UNAUTHORIZED', 401))
    const { result } = await renderHook(useLatestCheckIn, { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(clerkMock.endSession).not.toHaveBeenCalled()
    expect(clerkMock.signOut).not.toHaveBeenCalled()
  })

  it('keeps the same clients across re-renders', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => null))

    const { result, rerender } = await renderHook(() => useApi(), { wrapper: Wrapper })
    const firstApi = result.current
    await rerender({})

    expect(result.current.checkIn.latestForDate.queryKey({ localDate: '2026-10-19' })).toEqual(
      firstApi.checkIn.latestForDate.queryKey({ localDate: '2026-10-19' }),
    )
  })
})

describe('ApiProviderContext cache scoping', () => {
  const CACHE_KEY = ['probe']

  it('starts a new cache when the device language changes', async () => {
    const { result } = await renderHook(() => useQueryClient(), { wrapper: Wrapper })
    const previousClient = result.current
    previousClient.setQueryData(CACHE_KEY, 'portuguese-content')

    try {
      await act(() => i18n.changeLanguage('en'))

      expect(result.current).not.toBe(previousClient)
      expect(result.current.getQueryData(CACHE_KEY)).toBeUndefined()
    } finally {
      await act(() => i18n.changeLanguage('pt-BR'))
    }
  })

  it('starts a new cache when the same account changes sessions directly', async () => {
    clerkMock.state = {
      isLoaded: true,
      isSignedIn: true,
      userId: 'user_a',
      sessionId: 'session_1',
    }
    const { result } = await renderHook(() => useQueryClient(), { wrapper: Wrapper })
    const previousClient = result.current
    previousClient.setQueryData(CACHE_KEY, 'previous-session')

    await act(async () => {
      clerkMock.setState({ ...clerkMock.state, sessionId: 'session_2' })
    })

    expect(result.current).not.toBe(previousClient)
    expect(result.current.getQueryData(CACHE_KEY)).toBeUndefined()
  })

  async function renderWithCachedData(userId: string) {
    clerkMock.state = { isLoaded: true, isSignedIn: true, userId }
    const hook = await renderHook(() => useQueryClient(), { wrapper: Wrapper })
    hook.result.current.setQueryData(CACHE_KEY, 'user-a-data')
    return hook
  }

  async function changeUser(userId: string | null) {
    await act(async () => {
      clerkMock.setState({ isLoaded: true, isSignedIn: userId !== null, userId })
    })
  }

  it('clears the cache when another user signs in', async () => {
    const { result } = await renderWithCachedData('user_a')

    await changeUser('user_b')

    expect(result.current.getQueryData(CACHE_KEY)).toBeUndefined()
  })

  it('keeps the cache while the same user stays signed in', async () => {
    const { result } = await renderWithCachedData('user_a')

    await changeUser('user_a')

    expect(result.current.getQueryData(CACHE_KEY)).toBe('user-a-data')
  })

  it('clears the cache on sign-out', async () => {
    const { result } = await renderWithCachedData('user_a')

    await changeUser(null)

    expect(result.current.getQueryData(CACHE_KEY)).toBeUndefined()
  })

  it('still resolves a query that mounts in the same commit as the sign-in', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => ({ id: 'check-in-1' })))
    clerkMock.state = { isLoaded: true, isSignedIn: false, userId: null }

    // Like the entry route: it mounts as soon as the session exists, together with the user change.
    function SignedInProbe() {
      const query = useLatestCheckIn()
      return <Text>{query.data ? 'loaded' : 'pending'}</Text>
    }
    function Gate() {
      const { isSignedIn } = useAuth()
      return isSignedIn ? <SignedInProbe /> : null
    }
    await render(<Gate />, { wrapper: Wrapper })

    await act(async () => {
      clerkMock.setState({ isLoaded: true, isSignedIn: true, userId: 'user_a' })
    })

    await waitFor(() => expect(screen.getByText('loaded')).toBeTruthy())
  })

  describe('with a screen still mounted at the switch', () => {
    // A screen outside the guarded groups keeps reading the query while the user changes.
    function MountedProbe() {
      const query = useLatestCheckIn()
      return <Text>{query.data ? `data:${query.data.id}` : 'pending'}</Text>
    }

    // The next response is held until `release` is called, so the moment between the switch and the
    // refetch can be observed.
    function holdResponse(outcome: 'success' | 'failure') {
      let release = () => {}
      const gate = new Promise<void>((resolve) => {
        release = resolve
      })
      server.use(
        http.get(`${TEST_API_BASE_URL}/trpc/checkIn.latestForDate`, async () => {
          await gate
          return outcome === 'success'
            ? HttpResponse.json({ result: { data: { id: 'check-in-user-b' } } })
            : HttpResponse.json(
                { error: { message: 'boom', code: -32603, data: {} } },
                { status: 500 },
              )
        }),
      )
      return release
    }

    async function renderMountedAs(userId: string) {
      server.use(mockQuery('checkIn.latestForDate', () => ({ id: 'check-in-user-a' })))
      clerkMock.state = { isLoaded: true, isSignedIn: true, userId }
      await render(<MountedProbe />, { wrapper: Wrapper })
      await waitFor(() => expect(screen.getByText('data:check-in-user-a')).toBeTruthy())
    }

    it('never shows user A data to user B, going through signed out', async () => {
      await renderMountedAs('user_a')
      const release = holdResponse('success')

      await changeUser(null)
      await waitFor(() => expect(screen.getByText('pending')).toBeTruthy())
      await changeUser('user_b')
      expect(screen.queryByText('data:check-in-user-a')).toBeNull()

      await act(async () => release())
      await waitFor(() => expect(screen.getByText('data:check-in-user-b')).toBeTruthy())
    })

    it('never shows user A data to user B, switching directly', async () => {
      await renderMountedAs('user_a')
      const release = holdResponse('success')

      await changeUser('user_b')
      // The reset reaches the screen on the next tick; until the response arrives only the skeleton state shows.
      await waitFor(() => expect(screen.getByText('pending')).toBeTruthy())
      expect(screen.queryByText('data:check-in-user-a')).toBeNull()

      await act(async () => release())
      await waitFor(() => expect(screen.getByText('data:check-in-user-b')).toBeTruthy())
    })

    it('does not fall back to user A data when the refetch for user B fails', async () => {
      await renderMountedAs('user_a')
      const release = holdResponse('failure')

      await changeUser('user_b')
      await act(async () => release())

      await waitFor(() => expect(screen.getByText('pending')).toBeTruthy())
      expect(screen.queryByText('data:check-in-user-a')).toBeNull()
    })
  })
})

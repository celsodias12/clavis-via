import { useApi } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { useAuth } from '@clerk/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw/http'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vite-plus/test'
import { clerkMock } from '../../tests/utils/clerk-mock'
import { i18n } from '../configs/i18n.config'
import { ContextProviders } from './index'

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
  it('serves tRPC queries through the Clerk session token', async () => {
    clerkMock.state = { isLoaded: true, isSignedIn: true, sessionId: 'session_a' }
    clerkMock.getToken.mockResolvedValue('session-token')
    let authorization: string | null = null
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/checkIn.latestForDate`, ({ request }) => {
        authorization = request.headers.get('authorization')
        return HttpResponse.json({ result: { data: null } })
      }),
    )

    const { result } = renderHook(useLatestCheckIn, { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(authorization).toBe('Bearer session-token')
  })

  it('signs the user out when the API rejects the session', async () => {
    clerkMock.state = { isLoaded: true, isSignedIn: true, sessionId: 'session_a' }
    server.use(mockTrpcError('checkIn.latestForDate', 'UNAUTHORIZED', 401))

    const { result } = renderHook(useLatestCheckIn, { wrapper: Wrapper })

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
    renderHook(useLatestCheckIn, { wrapper: Wrapper })
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
    const { result } = renderHook(useLatestCheckIn, { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(clerkMock.endSession).not.toHaveBeenCalled()
    expect(clerkMock.signOut).not.toHaveBeenCalled()
  })

  it('keeps the same clients across re-renders', () => {
    const { result, rerender } = renderHook(() => useApi(), { wrapper: Wrapper })
    const firstApi = result.current

    rerender()

    expect(result.current).toBe(firstApi)
  })
})

describe('ApiProviderContext cache scoping', () => {
  const CACHE_KEY = ['probe']

  it('starts a new cache when the browser language changes', async () => {
    const { result } = renderHook(() => useQueryClient(), { wrapper: Wrapper })
    const previousClient = result.current
    previousClient.setQueryData(CACHE_KEY, 'portuguese-content')

    try {
      await act(() => i18n.changeLanguage('es'))

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
    const { result } = renderHook(() => useQueryClient(), { wrapper: Wrapper })
    const previousClient = result.current
    previousClient.setQueryData(CACHE_KEY, 'previous-session')

    await act(async () => {
      clerkMock.setState({ ...clerkMock.state, sessionId: 'session_2' })
    })

    expect(result.current).not.toBe(previousClient)
    expect(result.current.getQueryData(CACHE_KEY)).toBeUndefined()
  })

  function renderWithCachedData(userId: string) {
    clerkMock.state = { isLoaded: true, isSignedIn: true, userId }
    const hook = renderHook(() => useQueryClient(), { wrapper: Wrapper })
    hook.result.current.setQueryData(CACHE_KEY, 'user-a-data')
    return hook
  }

  async function changeUser(userId: string | null) {
    await act(async () => {
      clerkMock.setState({ isLoaded: true, isSignedIn: userId !== null, userId })
    })
  }

  it('drops the previous user data when another user signs in', async () => {
    const { result } = renderWithCachedData('user_a')

    await changeUser('user_b')

    expect(result.current.getQueryData(CACHE_KEY)).toBeUndefined()
  })

  it('keeps the cache while the same user stays signed in', async () => {
    const { result } = renderWithCachedData('user_a')

    await changeUser('user_a')

    expect(result.current.getQueryData(CACHE_KEY)).toBe('user-a-data')
  })

  it('drops the cache on sign-out', async () => {
    const { result } = renderWithCachedData('user_a')

    await changeUser(null)

    expect(result.current.getQueryData(CACHE_KEY)).toBeUndefined()
  })

  it('still resolves a query that mounts in the same commit as the sign-in', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => ({ id: 'check-in-1' })))
    clerkMock.state = { isLoaded: true, isSignedIn: false, userId: null }

    function SignedInProbe() {
      const query = useLatestCheckIn()
      return <p>{query.data ? 'loaded' : 'pending'}</p>
    }
    function Gate() {
      const { isSignedIn } = useAuth()
      return isSignedIn ? <SignedInProbe /> : null
    }
    render(<Gate />, { wrapper: Wrapper })

    await changeUser('user_a')

    await waitFor(() => expect(screen.getByText('loaded')).toBeTruthy())
  })

  it('never shows user A data to user B while a screen stays mounted', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => ({ id: 'check-in-user-a' })))
    clerkMock.state = { isLoaded: true, isSignedIn: true, userId: 'user_a' }
    function MountedProbe() {
      const query = useLatestCheckIn()
      return <p>{query.data ? `data:${query.data.id}` : 'pending'}</p>
    }
    render(<MountedProbe />, { wrapper: Wrapper })
    await waitFor(() => expect(screen.getByText('data:check-in-user-a')).toBeTruthy())

    // The next response is held, so the moment between the switch and the refetch can be observed.
    let release = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/checkIn.latestForDate`, async () => {
        await gate
        return HttpResponse.json({ result: { data: { id: 'check-in-user-b' } } })
      }),
    )

    await changeUser('user_b')
    await waitFor(() => expect(screen.getByText('pending')).toBeTruthy())
    expect(screen.queryByText('data:check-in-user-a')).toBeNull()

    await act(async () => release())
    await waitFor(() => expect(screen.getByText('data:check-in-user-b')).toBeTruthy())
  })
})

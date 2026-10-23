import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { clerkMock } from '../../../tests/utils/clerk-mock'
import { CLERK_LOAD_TIMEOUT_MILLISECONDS } from '../../constants/authentication.constant'
import { useClerkLoadFailure } from './use-clerk-load-failure'

afterEach(() => {
  vi.useRealTimers()
})

describe('useClerkLoadFailure', () => {
  it('is false while Clerk is loading and false forever once it has loaded', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ isLoaded }) => useClerkLoadFailure(isLoaded), {
      initialProps: { isLoaded: false },
    })
    expect(result.current).toBe(false)

    rerender({ isLoaded: true })
    act(() => vi.advanceTimersByTime(CLERK_LOAD_TIMEOUT_MILLISECONDS * 2))

    expect(result.current).toBe(false)
  })

  it('is true as soon as Clerk reports an error', () => {
    clerkMock.status = 'error'

    const { result } = renderHook(() => useClerkLoadFailure(false))

    expect(result.current).toBe(true)
  })

  it('is true once the timeout passes without Clerk loading', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useClerkLoadFailure(false))

    act(() => vi.advanceTimersByTime(CLERK_LOAD_TIMEOUT_MILLISECONDS))

    expect(result.current).toBe(true)
  })

  it('does not report an error that Clerk already got past', () => {
    clerkMock.status = 'error'

    const { result } = renderHook(() => useClerkLoadFailure(true))

    expect(result.current).toBe(false)
  })
})

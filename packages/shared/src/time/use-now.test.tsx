import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { TimeProviderContext, useTime } from './time-provider'
import { useNow } from './use-now'

// Local time (America/Sao_Paulo in the test setup) on 19 October 2026.
function at(hours: number, minutes = 0) {
  return new Date(2026, 9, 19, hours, minutes)
}

describe('useNow', () => {
  let emitForeground: () => void
  const unsubscribe = vi.fn()
  const subscribeToForeground = vi.fn((onForeground: () => void) => {
    emitForeground = onForeground
    return unsubscribe
  })

  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <TimeProviderContext subscribeToForeground={subscribeToForeground}>
        {children}
      </TimeProviderContext>
    )
  }

  beforeEach(() => {
    vi.useFakeTimers({ now: at(22) })
    unsubscribe.mockClear()
    subscribeToForeground.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the current time', () => {
    const { result } = renderHook(useNow, { wrapper: Wrapper })

    expect(result.current.getTime()).toBe(at(22).getTime())
  })

  it('refreshes when the platform reports the app back in the foreground the next morning', () => {
    const { result } = renderHook(useNow, { wrapper: Wrapper })

    // The process stayed alive overnight, so no timer fired while the app was in the background.
    vi.setSystemTime(at(8))
    act(() => emitForeground())

    expect(result.current.getTime()).toBe(at(8).getTime())
  })

  it('subscribes once and keeps the subscription across re-renders', () => {
    const { rerender } = renderHook(useNow, { wrapper: Wrapper })

    rerender()

    expect(subscribeToForeground).toHaveBeenCalledTimes(1)
  })

  it('refreshes at midnight and at each greeting change while the app stays open', () => {
    const { result } = renderHook(useNow, { wrapper: Wrapper })

    act(() => {
      vi.advanceTimersByTime(2 * 60 * 60 * 1000)
    })
    expect(result.current.getTime()).toBe(at(24).getTime())

    act(() => {
      vi.advanceTimersByTime(5 * 60 * 60 * 1000)
    })
    expect(result.current.getTime()).toBe(at(29).getTime())

    act(() => {
      vi.advanceTimersByTime(7 * 60 * 60 * 1000)
    })
    expect(result.current.getTime()).toBe(at(36).getTime())

    act(() => {
      vi.advanceTimersByTime(6 * 60 * 60 * 1000)
    })
    expect(result.current.getTime()).toBe(at(42).getTime())
  })

  it('does not refresh before the next boundary', () => {
    const { result } = renderHook(useNow, { wrapper: Wrapper })
    const first = result.current

    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000)
    })

    expect(result.current).toBe(first)
  })

  it('unsubscribes and clears its timer on unmount', () => {
    const clearTimer = vi.spyOn(globalThis, 'clearTimeout')
    const { unmount } = renderHook(useNow, { wrapper: Wrapper })
    clearTimer.mockClear()

    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
    expect(clearTimer).toHaveBeenCalledTimes(1)
  })

  it('refuses to run outside a TimeProviderContext', () => {
    expect(() => renderHook(() => useTime())).toThrow('TimeProviderContext')
  })
})

import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { usePauseWhenHidden } from './use-pause-when-hidden'

function setVisibility(state: 'hidden' | 'visible') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: state })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('usePauseWhenHidden', () => {
  afterEach(() => {
    setVisibility('visible')
  })

  it('pauses when the tab is hidden and not when it comes back', () => {
    const pause = vi.fn()
    renderHook(() => usePauseWhenHidden(pause))

    act(() => setVisibility('hidden'))
    expect(pause).toHaveBeenCalledTimes(1)

    act(() => setVisibility('visible'))
    expect(pause).toHaveBeenCalledTimes(1)
  })

  it('stops listening when unmounted', () => {
    const pause = vi.fn()
    const removeListener = vi.spyOn(document, 'removeEventListener')
    const { unmount } = renderHook(() => usePauseWhenHidden(pause))

    unmount()
    act(() => setVisibility('hidden'))

    expect(removeListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    expect(pause).not.toHaveBeenCalled()
  })
})

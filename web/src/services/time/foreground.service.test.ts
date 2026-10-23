import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { FOREGROUND } from '../../constants/foreground.constant'
import { subscribeToWindowForeground } from './foreground.service'

function setVisibility(state: DocumentVisibilityState) {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state)
  document.dispatchEvent(new Event(FOREGROUND.VISIBILITY_CHANGE_EVENT))
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('subscribeToWindowForeground', () => {
  it('calls back when the tab becomes visible', () => {
    const onForeground = vi.fn()
    const unsubscribe = subscribeToWindowForeground(onForeground)

    setVisibility('visible')

    expect(onForeground).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('ignores the tab being hidden', () => {
    const onForeground = vi.fn()
    const unsubscribe = subscribeToWindowForeground(onForeground)

    setVisibility('hidden')

    expect(onForeground).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('calls back when the window regains focus', () => {
    const onForeground = vi.fn()
    const unsubscribe = subscribeToWindowForeground(onForeground)

    window.dispatchEvent(new Event(FOREGROUND.FOCUS_EVENT))

    expect(onForeground).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('stops calling back after unsubscribing', () => {
    const onForeground = vi.fn()
    subscribeToWindowForeground(onForeground)()

    setVisibility('visible')
    window.dispatchEvent(new Event(FOREGROUND.FOCUS_EVENT))

    expect(onForeground).not.toHaveBeenCalled()
  })
})

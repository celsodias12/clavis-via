import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { usePracticeTimer } from './use-practice-timer'

const DURATION_SECONDS = 180

describe('usePracticeTimer', () => {
  const audio = { play: vi.fn(), pause: vi.fn() }
  const onFinish = vi.fn()

  function renderTimer(callback = onFinish) {
    return renderHook(() =>
      usePracticeTimer({ durationSeconds: DURATION_SECONDS, onFinish: callback }, audio),
    )
  }

  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(2026, 9, 20, 10, 0, 0) })
    audio.play.mockClear()
    audio.pause.mockClear()
    onFinish.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts stopped at 0 seconds without touching the audio', () => {
    const { result } = renderTimer()

    expect(result.current).toMatchObject({ elapsedSeconds: 0, isPlaying: false, isFinished: false })
    expect(audio.play).not.toHaveBeenCalled()
  })

  it('plays the audio and the clock together and pauses them together', () => {
    const { result } = renderTimer()

    act(() => result.current.toggle())
    expect(result.current.isPlaying).toBe(true)
    expect(audio.play).toHaveBeenCalledTimes(1)

    act(() => vi.advanceTimersByTime(90_000))
    expect(result.current.elapsedSeconds).toBe(90)

    act(() => result.current.toggle())
    expect(result.current.isPlaying).toBe(false)
    expect(audio.pause).toHaveBeenCalledTimes(1)

    act(() => vi.advanceTimersByTime(30_000))
    expect(result.current.elapsedSeconds).toBe(90)

    act(() => result.current.toggle())
    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current.elapsedSeconds).toBe(100)
    expect(audio.play).toHaveBeenCalledTimes(2)
  })

  it('reads the time from the clock, so a late tick still lands on the real time', () => {
    const { result } = renderTimer()
    act(() => result.current.toggle())

    // The thread was blocked for a minute: only the clock knows how long the practice has played.
    vi.setSystemTime(Date.now() + 60_000)
    act(() => vi.advanceTimersByTime(250))

    expect(result.current.elapsedSeconds).toBe(60)
  })

  it('pauses on demand and stays paused', () => {
    const { result } = renderTimer()
    act(() => result.current.toggle())
    act(() => vi.advanceTimersByTime(20_000))

    act(() => result.current.pause())
    expect(result.current.isPlaying).toBe(false)
    expect(audio.pause).toHaveBeenCalledTimes(1)
    act(() => vi.advanceTimersByTime(60_000))
    expect(result.current.elapsedSeconds).toBe(20)
  })

  it('ignores a pause request while nothing is playing', () => {
    const { result } = renderTimer()

    act(() => result.current.pause())

    expect(result.current.isPlaying).toBe(false)
    expect(audio.pause).not.toHaveBeenCalled()
  })

  it('finishes at the duration: stops, flags it and calls onFinish exactly once', () => {
    const { result } = renderTimer()
    act(() => result.current.toggle())

    act(() => vi.advanceTimersByTime(DURATION_SECONDS * 1000))

    expect(result.current).toMatchObject({
      elapsedSeconds: DURATION_SECONDS,
      isPlaying: false,
      isFinished: true,
    })
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(audio.pause).toHaveBeenCalledTimes(1)

    act(() => vi.advanceTimersByTime(60_000))
    expect(onFinish).toHaveBeenCalledTimes(1)

    // A finished practice does not start again until it is restarted.
    act(() => result.current.toggle())
    expect(result.current.isPlaying).toBe(false)
    expect(audio.play).toHaveBeenCalledTimes(1)
  })

  it('never goes past the duration when a tick arrives late', () => {
    const { result } = renderTimer()
    act(() => result.current.toggle())

    vi.setSystemTime(Date.now() + 10 * DURATION_SECONDS * 1000)
    act(() => vi.advanceTimersByTime(250))

    expect(result.current.elapsedSeconds).toBe(DURATION_SECONDS)
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('restarts from 0:00, paused, and can be finished again', () => {
    const { result } = renderTimer()
    act(() => result.current.toggle())
    act(() => vi.advanceTimersByTime(DURATION_SECONDS * 1000))
    expect(result.current.isFinished).toBe(true)

    act(() => result.current.restart())
    expect(result.current).toMatchObject({ elapsedSeconds: 0, isPlaying: false, isFinished: false })

    act(() => result.current.toggle())
    act(() => vi.advanceTimersByTime(DURATION_SECONDS * 1000))
    expect(onFinish).toHaveBeenCalledTimes(2)
  })

  it('restarts a practice that is still playing', () => {
    const { result } = renderTimer()
    act(() => result.current.toggle())
    act(() => vi.advanceTimersByTime(45_000))

    act(() => result.current.restart())

    expect(result.current).toMatchObject({ elapsedSeconds: 0, isPlaying: false })
    expect(audio.pause).toHaveBeenCalledTimes(1)
    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current.elapsedSeconds).toBe(0)
  })

  it('calls the latest onFinish', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { result, rerender } = renderHook(
      (callback: () => void) =>
        usePracticeTimer({ durationSeconds: DURATION_SECONDS, onFinish: callback }, audio),
      { initialProps: first },
    )
    act(() => result.current.toggle())
    rerender(second)

    act(() => vi.advanceTimersByTime(DURATION_SECONDS * 1000))

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('keeps the same pause function across renders and stops ticking when unmounted', () => {
    const { result, rerender, unmount } = renderTimer()
    const firstPause = result.current.pause
    const clearInterval = vi.spyOn(globalThis, 'clearInterval')
    act(() => result.current.toggle())

    rerender()
    expect(result.current.pause).toBe(firstPause)
    unmount()

    expect(clearInterval).toHaveBeenCalledTimes(1)
  })

  it('ignores a tick that arrives after the pause but before the screen has updated', () => {
    const { result } = renderTimer()
    act(() => result.current.toggle())
    act(() => vi.advanceTimersByTime(5_000))

    // Inside one act the pause is not rendered yet, so the interval is still alive for the next tick.
    act(() => {
      result.current.pause()
      vi.advanceTimersByTime(250)
    })

    expect(result.current).toMatchObject({ elapsedSeconds: 5, isPlaying: false })
  })
})

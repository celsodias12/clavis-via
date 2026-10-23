import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { usePracticeAudio } from './use-practice-audio'

describe('usePracticeAudio', () => {
  let play: ReturnType<typeof vi.spyOn>
  let pause: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not play before it is asked to', () => {
    renderHook(() => usePracticeAudio())

    expect(play).not.toHaveBeenCalled()
  })

  it('plays the looping ambient loop and pauses it', () => {
    const { result } = renderHook(() => usePracticeAudio())

    result.current.play()
    result.current.pause()

    expect(play).toHaveBeenCalledTimes(1)
    const audio = play.mock.contexts[0] as HTMLAudioElement
    expect(audio.loop).toBe(true)
    expect(audio.src).toContain('/audio/practice-ambient.m4a')
    expect(pause).toHaveBeenCalledTimes(1)
  })

  it('keeps the same sound across renders', () => {
    const { result, rerender } = renderHook(() => usePracticeAudio())
    result.current.play()

    rerender()
    result.current.play()

    expect(play.mock.contexts[0]).toBe(play.mock.contexts[1])
  })

  it('carries on without the sound when it cannot be played', async () => {
    play.mockRejectedValue(new DOMException('blocked', 'NotAllowedError'))
    const { result } = renderHook(() => usePracticeAudio())

    expect(() => result.current.play()).not.toThrow()
    await Promise.resolve()
  })

  it('stops the sound when the screen is left', () => {
    const { unmount } = renderHook(() => usePracticeAudio())

    unmount()

    expect(pause).toHaveBeenCalledTimes(1)
  })
})

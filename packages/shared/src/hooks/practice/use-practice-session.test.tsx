import { act, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { mockMutation, mockQuery, mockTrpcError } from '../../../tests/utils/api-handlers'
import { renderHookWithProviders } from '../../../tests/utils/render-hook'
import { server } from '../../../tests/utils/server'
import { TRPC_ERROR_CODES } from '../../constants/api.constant'
import { PRACTICE_PLAY_STATES } from '../../constants/practice.constant'
import { toLocalDate } from '../../utils/date'
import { usePracticeSession } from './use-practice-session'

const PRACTICE = {
  id: 'guided-breathing',
  title: 'Respiração',
  durationSeconds: 180,
  description: 'd',
}
const DURATION_MILLISECONDS = PRACTICE.durationSeconds * 1000

describe('usePracticeSession', () => {
  const audio = { play: vi.fn(), pause: vi.fn() }

  function setup() {
    server.use(mockQuery('practice.byId', () => PRACTICE))
    return renderHookWithProviders(() => usePracticeSession({ practiceId: PRACTICE.id, audio }))
  }

  async function loaded() {
    const rendered = setup()
    await waitFor(() => expect(rendered.result.current.data).toEqual(PRACTICE))
    return rendered
  }

  // Plays the practice to its end on a fake clock, then gives the real timers back to the network (MSW) and
  // to waitFor. The clock only needs to run while the practice plays.
  function playToTheEnd(result: { current: { onPlayPress: () => void } }) {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
    act(() => result.current.onPlayPress())
    act(() => {
      vi.advanceTimersByTime(DURATION_MILLISECONDS)
    })
    vi.useRealTimers()
  }

  beforeEach(() => {
    audio.play.mockClear()
    audio.pause.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('loads the practice, starts the sound on play and pauses it on the next press', async () => {
    const { result } = await loaded()
    expect(result.current.playState).toBe(PRACTICE_PLAY_STATES.PLAY)

    act(() => result.current.onPlayPress())
    expect(audio.play).toHaveBeenCalledTimes(1)
    expect(result.current.playState).toBe(PRACTICE_PLAY_STATES.PAUSE)
    expect(result.current.isPlaying).toBe(true)

    act(() => result.current.onPlayPress())
    expect(audio.pause).toHaveBeenCalledTimes(1)
    expect(result.current.playState).toBe(PRACTICE_PLAY_STATES.PLAY)
  })

  it('pauses on request of the platform, for example when the tab is hidden', async () => {
    const { result } = await loaded()
    act(() => result.current.onPlayPress())

    act(() => result.current.pause())

    expect(result.current.isPlaying).toBe(false)
    expect(audio.pause).toHaveBeenCalledTimes(1)
  })

  it("records the practice with today's date once, when the practice finishes", async () => {
    const received: unknown[] = []
    server.use(
      mockMutation('practice.complete', (input) => {
        received.push(input)
        return input
      }),
    )
    const { result } = await loaded()

    playToTheEnd(result)

    await waitFor(() => expect(result.current.isSaved).toBe(true))
    expect(received).toEqual([{ practiceId: PRACTICE.id, localDate: toLocalDate(new Date()) }])
    expect(result.current.isFinished).toBe(true)
    expect(result.current.playState).toBe(PRACTICE_PLAY_STATES.AGAIN)
  })

  it('plays again with one press: clears the result, restarts and plays', async () => {
    server.use(mockTrpcError('practice.complete', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    const { result } = await loaded()
    playToTheEnd(result)
    await waitFor(() => expect(result.current.hasSaveError).toBe(true))

    act(() => result.current.onPlayPress())

    await waitFor(() => expect(result.current.hasSaveError).toBe(false))
    expect(result.current.isFinished).toBe(false)
    expect(result.current.isPlaying).toBe(true)
    expect(result.current.elapsedSeconds).toBe(0)
    expect(audio.play).toHaveBeenCalledTimes(2)
  })

  it('records again on demand after a failed record', async () => {
    server.use(mockTrpcError('practice.complete', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    const { result } = await loaded()
    playToTheEnd(result)
    await waitFor(() => expect(result.current.hasSaveError).toBe(true))
    server.use(mockMutation('practice.complete', (input) => input))

    act(() => result.current.recordPractice())

    await waitFor(() => expect(result.current.isSaved).toBe(true))
  })

  it('does not report the save result before the practice has finished', async () => {
    const { result } = await loaded()

    expect(result.current.hasSaveError).toBe(false)
    expect(result.current.isSaved).toBe(false)
    expect(result.current.isSaving).toBe(false)
  })
})

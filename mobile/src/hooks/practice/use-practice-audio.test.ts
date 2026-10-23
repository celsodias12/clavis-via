import { renderHook } from '@testing-library/react-native'
import { useAudioPlayer } from 'expo-audio'
import { usePracticeAudio } from './use-practice-audio'

jest.mock('expo-audio', () => ({ useAudioPlayer: jest.fn() }))

describe('usePracticeAudio', () => {
  const player = { play: jest.fn(), pause: jest.fn(), loop: false }

  beforeEach(() => {
    player.play.mockClear()
    player.pause.mockClear()
    player.loop = false
    jest
      .mocked(useAudioPlayer)
      .mockReturnValue(player as unknown as ReturnType<typeof useAudioPlayer>)
  })

  it('loops the ambient sound and does not play before it is asked to', async () => {
    await renderHook(() => usePracticeAudio())

    expect(player.loop).toBe(true)
    expect(player.play).not.toHaveBeenCalled()
  })

  it('plays and pauses the sound', async () => {
    const { result } = await renderHook(() => usePracticeAudio())

    result.current.play()
    result.current.pause()

    expect(player.play).toHaveBeenCalledTimes(1)
    expect(player.pause).toHaveBeenCalledTimes(1)
  })
})

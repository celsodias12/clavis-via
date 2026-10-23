import type { PracticeAudio } from '@clavis-via/shared'
import { useAudioPlayer } from 'expo-audio'
import { useEffect } from 'react'
import { PRACTICE_AMBIENT_AUDIO } from '../../constants/practice-media.constant'

// The looping ambient sound of a practice.
export function usePracticeAudio(): PracticeAudio {
  const player = useAudioPlayer(PRACTICE_AMBIENT_AUDIO)

  useEffect(() => {
    // False positive: the player is a native-backed shared object from expo-audio, not React state, and
    // assigning `loop` is its documented API.
    // react-doctor-disable-next-line react-hooks-js/immutability
    player.loop = true
  }, [player])

  return { play: () => player.play(), pause: () => player.pause() }
}

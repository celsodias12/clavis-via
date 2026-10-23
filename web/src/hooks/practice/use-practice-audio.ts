import type { PracticeAudio } from '@clavis-via/shared'
import { useEffect, useState } from 'react'
import { PRACTICE_AUDIO_URL } from '../../constants/practice.constant'

// The looping ambient sound of a practice. It only starts from a click (autoplay policy); when the file cannot
// be loaded or played the clock and the bar carry on without it. Leaving the screen stops it.
export function usePracticeAudio(): PracticeAudio {
  const [audio] = useState(() => Object.assign(new Audio(PRACTICE_AUDIO_URL), { loop: true }))

  useEffect(() => () => audio.pause(), [audio])

  return {
    // A rejected play (blocked, or the file is missing) must not stop the practice.
    play: () => {
      audio.play().catch(() => {})
    },
    pause: () => audio.pause(),
  }
}

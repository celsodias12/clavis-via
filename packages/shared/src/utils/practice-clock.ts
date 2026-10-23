import type { PracticeClock } from '../@types/practice.type'
import { PRACTICE_PLAYER } from '../constants/practice.constant'

const toSeconds = (milliseconds: number) =>
  Math.floor(milliseconds / PRACTICE_PLAYER.MILLISECONDS_PER_SECOND)

// The time of a practice: the time played before the current run plus the time since the clock mark of the
// current run. The app and the web share it; each keeps only its own sound and its own "left the foreground"
// signal.
export function createPracticeClock(): PracticeClock {
  let playedMilliseconds = 0
  // Clock mark of the current run; null while stopped.
  let startedAt: number | null = null
  let finished = false

  return {
    isRunning: () => startedAt !== null,
    isFinished: () => finished,
    start: (nowMilliseconds) => {
      if (finished || startedAt !== null) {
        return false
      }
      startedAt = nowMilliseconds
      return true
    },
    pause: (nowMilliseconds) => {
      if (startedAt === null) {
        return null
      }
      playedMilliseconds += nowMilliseconds - startedAt
      startedAt = null
      return toSeconds(playedMilliseconds)
    },
    read: (nowMilliseconds, durationSeconds) => {
      if (startedAt === null) {
        return null
      }
      const played = playedMilliseconds + nowMilliseconds - startedAt
      if (played >= durationSeconds * PRACTICE_PLAYER.MILLISECONDS_PER_SECOND) {
        startedAt = null
        finished = true
        return { elapsedSeconds: durationSeconds, isFinished: true }
      }
      return { elapsedSeconds: toSeconds(played), isFinished: false }
    },
    restart: () => {
      playedMilliseconds = 0
      startedAt = null
      finished = false
    },
  }
}

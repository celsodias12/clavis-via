import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  PracticeAudio,
  PracticePlayerOptions,
  PracticeTimer,
} from '../../@types/practice.type'
import { PRACTICE_PLAYER } from '../../constants/practice.constant'
import { createPracticeClock } from '../../utils/practice-clock'

// The clock of a practice, driving the ambient sound through `audio`. The elapsed time comes from clock marks
// (Date.now), so a late tick or a blocked thread never makes it drift; the sound plays and pauses together
// with the time. The platform adds what is its own: creating the sound and calling `pause` when the app or
// tab leaves the foreground.
export function usePracticeTimer(
  { durationSeconds, onFinish }: PracticePlayerOptions,
  audio: PracticeAudio,
): PracticeTimer {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  // The time of the practice lives in the shared clock: one for the life of the screen.
  const [clock] = useState(createPracticeClock)
  const onFinishRef = useRef(onFinish)

  useEffect(() => {
    onFinishRef.current = onFinish
  })

  const pause = () => {
    const playedSeconds = clock.pause(Date.now())
    if (playedSeconds === null) {
      return
    }
    audio.pause()
    setIsPlaying(false)
    setElapsedSeconds(playedSeconds)
  }

  const finish = () => {
    audio.pause()
    setIsPlaying(false)
    setIsFinished(true)
    setElapsedSeconds(durationSeconds)
    onFinishRef.current()
  }

  const tick = () => {
    const reading = clock.read(Date.now(), durationSeconds)
    if (reading === null) {
      return
    }
    if (reading.isFinished) {
      finish()
      return
    }
    setElapsedSeconds(reading.elapsedSeconds)
  }

  const toggle = () => {
    if (clock.isRunning()) {
      pause()
      return
    }
    // A finished practice does not start again until it is restarted.
    if (clock.start(Date.now())) {
      audio.play()
      setIsPlaying(true)
    }
  }

  const restart = () => {
    audio.pause()
    clock.restart()
    setElapsedSeconds(0)
    setIsPlaying(false)
    setIsFinished(false)
  }

  // The interval and the platform subscription outlive a render, so they call the handlers of the latest one
  // through this ref.
  const handlersRef = useRef({ pause, tick })

  useEffect(() => {
    handlersRef.current = { pause, tick }
  })

  useEffect(() => {
    if (!isPlaying) {
      return
    }
    const timer = setInterval(
      () => handlersRef.current.tick(),
      PRACTICE_PLAYER.TICK_INTERVAL_MILLISECONDS,
    )
    return () => clearInterval(timer)
  }, [isPlaying])

  const pauseLatest = useCallback(() => handlersRef.current.pause(), [])

  return { elapsedSeconds, isPlaying, isFinished, toggle, restart, pause: pauseLatest }
}

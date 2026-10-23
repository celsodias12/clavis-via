import type { PracticePlayState, PracticeSessionOptions } from '../../@types/practice.type'
import { PRACTICE_PLAY_STATES } from '../../constants/practice.constant'
import { useNow } from '../../time/use-now'
import { toLocalDate } from '../../utils/date'
import { useCompletePractice } from './use-complete-practice'
import { usePractice } from './use-practice'
import { usePracticeTimer } from './use-practice-timer'

function playStateOf(isFinished: boolean, isPlaying: boolean): PracticePlayState {
  if (isFinished) {
    return PRACTICE_PLAY_STATES.AGAIN
  }
  return isPlaying ? PRACTICE_PLAY_STATES.PAUSE : PRACTICE_PLAY_STATES.PLAY
}

// Everything the Prática screen does apart from drawing: the practice query, the timer that drives the ambient
// sound (given by the platform), the one-time record when the practice finishes, and the play / pause / again
// button. `pause` is for the platform to call when the app or tab leaves the foreground.
export function usePracticeSession({ practiceId, audio }: PracticeSessionOptions) {
  const now = useNow()
  const { data, isPending, isFetching, refetch } = usePractice(practiceId)
  const completePractice = useCompletePractice()

  const recordPractice = () => completePractice.mutate({ practiceId, localDate: toLocalDate(now) })
  const { elapsedSeconds, isPlaying, isFinished, toggle, restart, pause } = usePracticeTimer(
    { durationSeconds: data?.durationSeconds ?? 0, onFinish: recordPractice },
    audio,
  )

  // "Again" is one press: back to 0:00 and playing, with the previous run's result cleared.
  const playAgain = () => {
    completePractice.reset()
    restart()
    toggle()
  }

  return {
    data,
    isPending,
    isFetching,
    refetch,
    elapsedSeconds,
    isPlaying,
    isFinished,
    playState: playStateOf(isFinished, isPlaying),
    onPlayPress: isFinished ? playAgain : toggle,
    pause,
    recordPractice,
    // The result of recording the practice, only meaningful once it has finished.
    isSaving: completePractice.isPending,
    hasSaveError: isFinished && completePractice.isError,
    isSaved: isFinished && completePractice.isSuccess,
  }
}

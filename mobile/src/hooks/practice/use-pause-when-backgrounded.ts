import { useEffect } from 'react'
import { AppState } from 'react-native'
import { APP_STATE_CHANGE_EVENT, APP_STATES } from '../../constants/app-state.constant'

// Calls `pause` when the app leaves the foreground. Coming back does not resume: the person starts again.
export function usePauseWhenBackgrounded(pause: () => void) {
  useEffect(() => {
    const subscription = AppState.addEventListener(APP_STATE_CHANGE_EVENT, (status) => {
      if (status !== APP_STATES.ACTIVE) {
        pause()
      }
    })
    return () => subscription.remove()
  }, [pause])
}

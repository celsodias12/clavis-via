import { AppState } from 'react-native'
import { APP_STATE_CHANGE_EVENT, APP_STATES } from '../../constants/app-state.constant'

// Mobile adapter of the shared clock: calls back whenever the app becomes active again.
export function subscribeToAppForeground(onForeground: () => void): () => void {
  const subscription = AppState.addEventListener(APP_STATE_CHANGE_EVENT, (status) => {
    if (status === APP_STATES.ACTIVE) {
      onForeground()
    }
  })
  return () => subscription.remove()
}

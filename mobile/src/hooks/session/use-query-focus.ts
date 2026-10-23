import { focusManager } from '@tanstack/react-query'
import { useEffect } from 'react'
import { AppState } from 'react-native'
import { APP_STATE_CHANGE_EVENT, APP_STATES } from '../../constants/app-state.constant'

// Native apps have no browser focus event. Notify Query so mounted stale queries refresh on resume.
export function useQueryFocus() {
  useEffect(() => {
    const subscription = AppState.addEventListener(APP_STATE_CHANGE_EVENT, (status) => {
      focusManager.setFocused(status === APP_STATES.ACTIVE)
    })
    return () => subscription.remove()
  }, [])
}

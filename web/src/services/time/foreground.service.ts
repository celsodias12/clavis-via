import { FOREGROUND } from '../../constants/foreground.constant'

// Web adapter of the shared clock: calls back when the tab becomes visible again and when the window regains
// focus. Module-level on purpose: the clock re-subscribes whenever the adapter's identity changes.
export function subscribeToWindowForeground(onForeground: () => void): () => void {
  const handleVisibilityChange = () => {
    if (document.visibilityState === FOREGROUND.VISIBLE_STATE) {
      onForeground()
    }
  }

  document.addEventListener(FOREGROUND.VISIBILITY_CHANGE_EVENT, handleVisibilityChange)
  window.addEventListener(FOREGROUND.FOCUS_EVENT, onForeground)

  return () => {
    document.removeEventListener(FOREGROUND.VISIBILITY_CHANGE_EVENT, handleVisibilityChange)
    window.removeEventListener(FOREGROUND.FOCUS_EVENT, onForeground)
  }
}

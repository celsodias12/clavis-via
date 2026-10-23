import { useEffect } from 'react'
import { DOCUMENT_EVENTS, DOCUMENT_VISIBILITY_STATES } from '../../constants/practice.constant'

// Calls `pause` when the tab is hidden. Coming back does not resume: the person starts again.
export function usePauseWhenHidden(pause: () => void) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === DOCUMENT_VISIBILITY_STATES.HIDDEN) {
        pause()
      }
    }
    document.addEventListener(DOCUMENT_EVENTS.VISIBILITY_CHANGE, handleVisibilityChange)
    return () =>
      document.removeEventListener(DOCUMENT_EVENTS.VISIBILITY_CHANGE, handleVisibilityChange)
  }, [pause])
}

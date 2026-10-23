import { useSyncExternalStore } from 'react'
import { WIDE_SCREEN_MINIMUM_WIDTH, WINDOW_EVENTS } from '../../constants/layout.constant'

function subscribe(listener: () => void) {
  window.addEventListener(WINDOW_EVENTS.RESIZE, listener)
  return () => window.removeEventListener(WINDOW_EVENTS.RESIZE, listener)
}

function getSnapshot() {
  return window.innerWidth >= WIDE_SCREEN_MINIMUM_WIDTH
}

// True from the wide screen breakpoint up. It follows the window width live, so a resize switches the layout
// without remounting the screen below.
export function useIsWideScreen() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

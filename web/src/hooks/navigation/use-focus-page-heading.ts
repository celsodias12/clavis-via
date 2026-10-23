import { useRouter } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

const HEADING_SELECTOR = 'h1'
const MAIN_SELECTOR = 'main'
const NOT_TABBABLE = '-1'
const USER_INPUT_EVENTS = ['pointerdown', 'keydown']

// After a navigation the focus would stay on the link that was used, which has just left the page; screen
// reader users would hear nothing about the new page. Once the router has rendered the new page this moves the
// focus to its heading (or to the main area while the heading is not there yet).
// Only navigations that follow a user input move the focus: the page that opens on load, and the redirects that
// follow it (/ to /start to /home), must not steal it. "Follows an input" is a fact, not a delay, so the result
// does not depend on how fast the page loads. A navigation that only changes the search or hash is left alone.
export function useFocusPageHeading() {
  const router = useRouter()

  const hasUserInput = useRef(false)

  useEffect(() => {
    const markUserInput = () => {
      hasUserInput.current = true
    }
    for (const eventName of USER_INPUT_EVENTS) {
      document.addEventListener(eventName, markUserInput, { capture: true })
    }
    const unsubscribe = router.subscribe('onRendered', ({ pathChanged }) => {
      if (!pathChanged || !hasUserInput.current) {
        return
      }
      const target =
        document.querySelector<HTMLElement>(HEADING_SELECTOR) ??
        document.querySelector<HTMLElement>(MAIN_SELECTOR)
      if (target === null) {
        return
      }
      target.setAttribute('tabindex', NOT_TABBABLE)
      target.focus({ preventScroll: true })
    })
    return () => {
      unsubscribe()
      for (const eventName of USER_INPUT_EVENTS) {
        document.removeEventListener(eventName, markUserInput, { capture: true })
      }
    }
  }, [router])
}

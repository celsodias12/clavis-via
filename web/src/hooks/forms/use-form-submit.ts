import { runWithPressLock } from '@clavis-via/shared'
import { type SubmitEvent, useRef } from 'react'

// The submit handler of a native <form>: stops the browser's own navigation and runs `submit` behind the press
// lock, so a double Enter or a click right after Enter sends the form once.
export function useFormSubmit(submit: () => unknown) {
  const lock = useRef(false)

  return (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    runWithPressLock(lock, submit)
  }
}

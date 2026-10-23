import { useEffect, useState } from 'react'
import { millisecondsUntilNextBoundary } from '../utils/date'
import { useTime } from './time-provider'

// The current device time, refreshed when the app returns to the foreground and when the local date or the
// greeting period changes while the app stays open, so "today" never goes stale.
export function useNow(): Date {
  const { subscribeToForeground } = useTime()

  const [now, setNow] = useState(() => new Date())

  useEffect(() => subscribeToForeground(() => setNow(new Date())), [subscribeToForeground])

  // Re-armed after every refresh, so the timer always points at the next boundary.
  useEffect(() => {
    const timer = setTimeout(() => setNow(new Date()), millisecondsUntilNextBoundary(now))
    return () => clearTimeout(timer)
  }, [now])

  return now
}

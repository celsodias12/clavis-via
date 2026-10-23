import { createContext, type ReactNode, useContext, useMemo } from 'react'
import type { SubscribeToForeground, TimeContextData } from '../@types/time.type'
import { TIME_PROVIDER_MISSING_MESSAGE } from '../constants/time.constant'

type TimeProviderProps = Readonly<{
  children: ReactNode
  subscribeToForeground: SubscribeToForeground
}>

const TimeContext = createContext<TimeContextData | null>(null)

// Each platform tells the clock how it learns that the app came back to the foreground (AppState on the
// mobile app, visibility and focus events on the web); the clock rules themselves live in useNow.
export function TimeProviderContext({ children, subscribeToForeground }: TimeProviderProps) {
  const data = useMemo(() => ({ subscribeToForeground }), [subscribeToForeground])

  return <TimeContext.Provider value={data}>{children}</TimeContext.Provider>
}

export function useTime(): TimeContextData {
  const data = useContext(TimeContext)
  if (data === null) {
    throw new Error(TIME_PROVIDER_MISSING_MESSAGE)
  }
  return data
}

import { useCallback } from 'react'
import { ToastAndroid } from 'react-native'

// The app is Android only, so a short confirmation is a native toast.
export function useToast(): (message: string) => void {
  return useCallback((message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT)
  }, [])
}

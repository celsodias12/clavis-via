import { useCallback } from 'react'
import { toast } from 'sonner'

// A short confirmation as a Sonner toast.
export function useToast(): (message: string) => void {
  return useCallback((message: string) => {
    toast(message)
  }, [])
}

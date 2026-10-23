import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ToastAndroid } from 'react-native'

// The app is Android only, so the "coming soon" notice is a native toast.
export function useComingSoon(): () => void {
  const { t } = useTranslation()

  return useCallback(() => {
    ToastAndroid.show(t('common.comingSoon'), ToastAndroid.SHORT)
  }, [t])
}

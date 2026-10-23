import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from './use-toast'

// The "coming soon" notice of features that are not built yet, as a Sonner toast.
export function useComingSoon(): () => void {
  const { t } = useTranslation()
  const showToast = useToast()

  return useCallback(() => showToast(t('common.comingSoon')), [showToast, t])
}

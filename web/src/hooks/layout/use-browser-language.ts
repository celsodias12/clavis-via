import { resolvePreferredLanguage } from '@clavis-via/shared'
import { useEffect } from 'react'
import { i18n } from '../../configs/i18n.config'
import { LANGUAGE_CHANGE_EVENT } from '../../constants/language.constant'

export function useBrowserLanguage() {
  useEffect(() => {
    const syncLanguage = () => {
      const language = resolvePreferredLanguage(navigator.languages)
      if (i18n.language !== language) {
        void i18n.changeLanguage(language)
      }
    }
    syncLanguage()
    window.addEventListener(LANGUAGE_CHANGE_EVENT, syncLanguage)
    return () => window.removeEventListener(LANGUAGE_CHANGE_EVENT, syncLanguage)
  }, [])
}

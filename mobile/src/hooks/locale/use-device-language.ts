import { resolvePreferredLanguage } from '@clavis-via/shared'
import { getLocales } from 'expo-localization'
import { useEffect } from 'react'
import { i18n } from '../../i18n/config'
import { subscribeToAppForeground } from '../../services/time/foreground.service'

// Android can change device preferences while this process is in the background.
export function useDeviceLanguage() {
  useEffect(() => {
    const syncLanguage = () => {
      const language = resolvePreferredLanguage(getLocales().map((locale) => locale.languageTag))
      if (i18n.language !== language) {
        void i18n.changeLanguage(language)
      }
    }
    syncLanguage()
    return subscribeToAppForeground(syncLanguage)
  }, [])
}

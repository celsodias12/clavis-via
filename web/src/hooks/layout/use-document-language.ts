import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// Keeps <html lang> in step with the detected language (screen readers and hyphenation read it).
export function useDocumentLanguage() {
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])
}

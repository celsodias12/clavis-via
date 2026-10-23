import { RouterProvider } from '@tanstack/react-router'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '../../configs/i18n.config'
import { router } from '../../configs/router.config'
import { ContextProviders } from '../../contexts'
import { useBrowserLanguage } from '../../hooks/layout/use-browser-language'
import { useDocumentLanguage } from '../../hooks/layout/use-document-language'
import { ThemeVariables } from '../theme-variables/theme-variables.component'
import { Toaster } from '../ui/sonner'

function Routes() {
  useBrowserLanguage()
  useDocumentLanguage()

  return <RouterProvider router={router} />
}

// Providers and global UI of the web app, with the router inside them.
export function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeVariables />
      <ContextProviders>
        <Routes />
        <Toaster />
      </ContextProviders>
    </I18nextProvider>
  )
}

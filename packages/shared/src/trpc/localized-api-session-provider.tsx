import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { ApiSessionResource } from '../@types/api.type'
import { resolveLanguage } from '../utils/language'
import { ApiSessionProviderContext } from './api-session-provider'

type LocalizedApiSessionProviderProps = Readonly<{
  children: ReactNode
  baseUrl: string
  session: ApiSessionResource | null | undefined
}>

// Replace observers and caches on session or language changes. Pending unauthorized actions keep
// their captured session resource, so they cannot end a session that signed in later.
export function LocalizedApiSessionProviderContext({
  children,
  baseUrl,
  session,
}: LocalizedApiSessionProviderProps) {
  const { i18n } = useTranslation()
  const language = resolveLanguage(i18n.language)

  return (
    <ApiSessionProviderContext
      key={`${session?.id ?? 'guest'}:${language}`}
      baseUrl={baseUrl}
      language={language}
      getToken={() => session?.getToken() ?? Promise.resolve(null)}
      onUnauthorized={() => session?.end()}
    >
      {children}
    </ApiSessionProviderContext>
  )
}

import { LocalizedApiSessionProviderContext } from '@clavis-via/shared'
import { useSession } from '@clerk/react'
import type { ReactNode } from 'react'
import { environment } from '../configs/environment.config'

type ApiProviderProps = Readonly<{ children: ReactNode }>

export function ApiProviderContext({ children }: ApiProviderProps) {
  const { session } = useSession()

  return (
    <LocalizedApiSessionProviderContext session={session} baseUrl={environment.apiBaseUrl}>
      {children}
    </LocalizedApiSessionProviderContext>
  )
}

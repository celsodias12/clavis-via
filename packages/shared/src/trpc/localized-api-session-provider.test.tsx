import { useQueryClient } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { HttpResponse, http } from 'msw/http'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { describe, expect, it, vi } from 'vite-plus/test'
import { mockTrpcError } from '../../tests/utils/api-handlers'
import { server } from '../../tests/utils/server'
import { TEST_API_BASE_URL } from '../../tests/utils/test-constants'
import { createI18n } from '../i18n/config'
import { LocalizedApiSessionProviderContext } from './localized-api-session-provider'
import { useApi } from './trpc.service'

describe('LocalizedApiSessionProviderContext', () => {
  it.each([true, false])(
    'sends the current language and scopes unauthorized actions (signed in: %s)',
    async (signedIn) => {
      const i18n = createI18n('es-MX')
      const end = vi.fn()
      const session = signedIn
        ? { id: 'session-a', getToken: async () => 'session-token', end }
        : undefined
      const headers: Record<string, string | null>[] = []
      server.use(
        http.get(`${TEST_API_BASE_URL}/trpc/plan.list`, ({ request }) => {
          headers.push({
            authorization: request.headers.get('authorization'),
            language: request.headers.get('accept-language'),
          })
          return HttpResponse.json({ result: { data: [] } })
        }),
      )
      function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
        return (
          <I18nextProvider i18n={i18n}>
            <LocalizedApiSessionProviderContext session={session} baseUrl={TEST_API_BASE_URL}>
              {children}
            </LocalizedApiSessionProviderContext>
          </I18nextProvider>
        )
      }
      const { result } = renderHook(() => ({ api: useApi(), client: useQueryClient() }), {
        wrapper: Wrapper,
      })

      const queryOptions = result.current.api.plan.list.queryOptions(undefined, {
        retry: false,
        staleTime: 0,
      })
      await expect(result.current.client.fetchQuery(queryOptions)).resolves.toEqual([])
      expect(headers).toEqual([
        { authorization: signedIn ? 'Bearer session-token' : null, language: 'es' },
      ])

      server.use(mockTrpcError('plan.list', 'UNAUTHORIZED', 401))
      await expect(result.current.client.fetchQuery(queryOptions)).rejects.toMatchObject({
        data: { code: 'UNAUTHORIZED' },
      })
      expect(end).toHaveBeenCalledTimes(signedIn ? 1 : 0)
    },
  )
})

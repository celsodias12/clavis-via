import type { AppRouter } from '@clavis-via/api/router'
import { createTRPCClient, httpLink } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import type { ApiClientOptions } from '../@types/api.type'
import { API } from '../constants/api.constant'
import { DEFAULT_LANGUAGE } from '../constants/language.constant'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

export function useApi() {
  return useTRPC()
}

// Plain httpLink (no batching) keeps one request per call, which also keeps test mocks simple.
export function createApiClient({
  baseUrl,
  getToken,
  language = DEFAULT_LANGUAGE,
  fetch: fetchImplementation,
}: ApiClientOptions) {
  let endOfBaseUrl = baseUrl.length
  while (baseUrl[endOfBaseUrl - 1] === '/') {
    endOfBaseUrl -= 1
  }

  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: `${baseUrl.slice(0, endOfBaseUrl)}${API.TRPC_PATH}`,
        fetch: fetchImplementation,
        async headers() {
          const token = await getToken()
          return {
            'Accept-Language': language,
            ...(token ? { [API.AUTHORIZATION_HEADER]: `${API.BEARER_PREFIX}${token}` } : {}),
          }
        },
      }),
    ],
  })
}

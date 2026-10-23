import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { TRPCClientError } from '@trpc/client'
import { HTTP_STATUS, QUERY_CLIENT, TRPC_ERROR_CODES } from '../constants/api.constant'

function getErrorCode(error: unknown): string | undefined {
  return error instanceof TRPCClientError ? error.data?.code : undefined
}

// A throttled request is rejected before tRPC runs, so the code is missing and only the HTTP status tells.
function isThrottled(error: unknown): boolean {
  const response = error instanceof TRPCClientError ? error.meta?.response : undefined
  return (response as Response | undefined)?.status === HTTP_STATUS.TOO_MANY_REQUESTS
}

export function createQueryClient(onUnauthorized: () => unknown): QueryClient {
  const handleError = (error: unknown) => {
    if (getErrorCode(error) === TRPC_ERROR_CODES.UNAUTHORIZED) {
      onUnauthorized()
    }
  }

  return new QueryClient({
    queryCache: new QueryCache({ onError: handleError }),
    mutationCache: new MutationCache({ onError: handleError }),
    defaultOptions: {
      queries: {
        staleTime: QUERY_CLIENT.STALE_TIME_MILLISECONDS,
        retry: (failureCount, error) => {
          const code = getErrorCode(error)
          const retryable =
            !isThrottled(error) &&
            (code === undefined || !QUERY_CLIENT.NON_RETRYABLE_ERROR_CODES.includes(code))
          return retryable && failureCount < QUERY_CLIENT.MAXIMUM_RETRIES
        },
      },
    },
  })
}

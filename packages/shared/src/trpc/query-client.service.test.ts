import { TRPCClientError } from '@trpc/client'
import { HttpResponse, http } from 'msw/http'
import { describe, expect, it, vi } from 'vite-plus/test'
import { server } from '../../tests/utils/server'
import { TEST_API_BASE_URL } from '../../tests/utils/test-constants'
import { createQueryClient } from './query-client.service'
import { createApiClient } from './trpc.service'

const QUERY_KEY = ['probe']

function trpcError(code: string) {
  return TRPCClientError.from({
    error: { message: code, code: -32603, data: { code, httpStatus: 500 } },
  } as never)
}

async function runQuery(
  queryClient: ReturnType<typeof createQueryClient>,
  queryFn: () => Promise<never>,
) {
  await queryClient.fetchQuery({ queryKey: QUERY_KEY, queryFn, retryDelay: 0 }).catch(() => {})
}

describe('createQueryClient', () => {
  it('calls onUnauthorized once and does not retry an UNAUTHORIZED query', async () => {
    const onUnauthorized = vi.fn()
    const queryFn = vi.fn(() => Promise.reject(trpcError('UNAUTHORIZED')))

    await runQuery(createQueryClient(onUnauthorized), queryFn)

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(queryFn).toHaveBeenCalledTimes(1)
  })

  it.each(['BAD_REQUEST', 'NOT_FOUND', 'TOO_MANY_REQUESTS'])(
    'does not retry a %s query',
    async (code) => {
      const onUnauthorized = vi.fn()
      const queryFn = vi.fn(() => Promise.reject(trpcError(code)))

      await runQuery(createQueryClient(onUnauthorized), queryFn)

      expect(queryFn).toHaveBeenCalledTimes(1)
      expect(onUnauthorized).not.toHaveBeenCalled()
    },
  )

  it('does not retry the plain 429 answer of the rate limiter', async () => {
    let requests = 0
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/checkIn.latestForDate`, () => {
        requests += 1
        return HttpResponse.json({ error: 'rate_limited' }, { status: 429 })
      }),
    )
    const apiClient = createApiClient({ baseUrl: TEST_API_BASE_URL, getToken: async () => null })
    const queryFn = () =>
      apiClient.checkIn.latestForDate.query({ localDate: '2026-10-19' }) as Promise<never>

    await runQuery(createQueryClient(vi.fn()), queryFn)

    expect(requests).toBe(1)
  })

  it('retries an INTERNAL_SERVER_ERROR query twice without signing out', async () => {
    const onUnauthorized = vi.fn()
    const queryFn = vi.fn(() => Promise.reject(trpcError('INTERNAL_SERVER_ERROR')))

    await runQuery(createQueryClient(onUnauthorized), queryFn)

    expect(queryFn).toHaveBeenCalledTimes(3)
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('retries errors that are not tRPC errors, such as a dropped network', async () => {
    const onUnauthorized = vi.fn()
    const queryFn = vi.fn(() => Promise.reject(new TypeError('Network request failed')))

    await runQuery(createQueryClient(onUnauthorized), queryFn)

    expect(queryFn).toHaveBeenCalledTimes(3)
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('calls onUnauthorized when a mutation fails with UNAUTHORIZED', async () => {
    const onUnauthorized = vi.fn()
    const queryClient = createQueryClient(onUnauthorized)

    await queryClient
      .getMutationCache()
      .build(queryClient, { mutationFn: () => Promise.reject(trpcError('UNAUTHORIZED')) })
      .execute(undefined)
      .catch(() => {})

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('keeps fetched data fresh for 30 seconds', () => {
    const queryClient = createQueryClient(vi.fn())

    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(30_000)
  })
})

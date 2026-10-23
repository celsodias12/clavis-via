import { TRPCClientError } from '@trpc/client'
import { HttpResponse, http } from 'msw/http'
import { describe, expect, it, vi } from 'vite-plus/test'
import { mockMutation, mockQuery, mockTrpcError } from '../../tests/utils/api-handlers'
import { server } from '../../tests/utils/server'
import { TEST_API_BASE_URL } from '../../tests/utils/test-constants'
import { createApiClient } from './trpc.service'

const CHECK_IN = {
  id: 'check-in-1',
  state: 'at-peace',
  otherText: null,
  localDate: '2026-10-19',
  createdAt: '2026-10-19T12:00:00.000Z',
  dailyKey: null,
}

describe('createApiClient', () => {
  it.each(['', '/', '///'])('normalizes a base URL ending in %s', async (suffix) => {
    let pathname = ''
    const client = createApiClient({
      baseUrl: `${TEST_API_BASE_URL}${suffix}`,
      getToken: async () => null,
      fetch: async (input) => {
        pathname = new URL(String(input)).pathname
        return Response.json({ result: { data: [] } })
      },
    })

    await client.plan.list.query()

    expect(pathname).toBe('/trpc/plan.list')
  })

  it('preserves slashes inside a long base path while removing trailing ones', async () => {
    const basePath = `/gateway${'/'.repeat(10_000)}api`
    let pathname = ''
    const client = createApiClient({
      baseUrl: `${TEST_API_BASE_URL}${basePath}///`,
      getToken: async () => null,
      fetch: async (input) => {
        pathname = new URL(String(input)).pathname
        return Response.json({ result: { data: [] } })
      },
    })

    await client.plan.list.query()

    expect(pathname).toBe(`${basePath}/trpc/plan.list`)
  })

  it('reads a query result through the mocked network', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => CHECK_IN))
    const client = createApiClient({ baseUrl: TEST_API_BASE_URL, getToken: async () => null })

    await expect(client.checkIn.latestForDate.query({ localDate: '2026-10-19' })).resolves.toEqual(
      CHECK_IN,
    )
  })

  it('forwards the query input to the handler', async () => {
    const resolver = vi.fn(() => null)
    server.use(mockQuery('checkIn.latestForDate', resolver))
    const client = createApiClient({ baseUrl: TEST_API_BASE_URL, getToken: async () => null })

    await client.checkIn.latestForDate.query({ localDate: '2026-10-19' })

    expect(resolver).toHaveBeenCalledWith({ localDate: '2026-10-19' })
  })

  it('sends the bearer token when one is available', async () => {
    let authorization: string | null = null
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/checkIn.latestForDate`, ({ request }) => {
        authorization = request.headers.get('Authorization')
        return HttpResponse.json({ result: { data: null } })
      }),
    )
    const client = createApiClient({ baseUrl: TEST_API_BASE_URL, getToken: async () => 'token-1' })

    await client.checkIn.latestForDate.query({ localDate: '2026-10-19' })

    expect(authorization).toBe('Bearer token-1')
  })

  it('sends the selected language with every request', async () => {
    let language: string | null = null
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/checkIn.latestForDate`, ({ request }) => {
        language = request.headers.get('Accept-Language')
        return HttpResponse.json({ result: { data: null } })
      }),
    )
    const client = createApiClient({
      baseUrl: TEST_API_BASE_URL,
      getToken: async () => null,
      language: 'es',
    })

    await client.checkIn.latestForDate.query({ localDate: '2026-10-19' })

    expect(language).toBe('es')
  })

  it('omits the Authorization header without a token', async () => {
    let authorization: string | null = 'unset'
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/checkIn.latestForDate`, ({ request }) => {
        authorization = request.headers.get('Authorization')
        return HttpResponse.json({ result: { data: null } })
      }),
    )
    const client = createApiClient({ baseUrl: TEST_API_BASE_URL, getToken: async () => null })

    await client.checkIn.latestForDate.query({ localDate: '2026-10-19' })

    expect(authorization).toBeNull()
  })

  it('posts mutation input as the request body', async () => {
    const resolver = vi.fn(() => CHECK_IN)
    server.use(mockMutation('checkIn.create', resolver))
    const client = createApiClient({ baseUrl: TEST_API_BASE_URL, getToken: async () => null })
    const input = { state: 'at-peace', localDate: '2026-10-19' } as const

    await expect(client.checkIn.create.mutate(input)).resolves.toEqual(CHECK_IN)
    expect(resolver).toHaveBeenCalledWith(input)
  })

  it('surfaces the tRPC error code on failure', async () => {
    server.use(mockTrpcError('checkIn.latestForDate', 'UNAUTHORIZED', 401))
    const client = createApiClient({ baseUrl: TEST_API_BASE_URL, getToken: async () => null })

    const failure = await client.checkIn.latestForDate
      .query({ localDate: '2026-10-19' })
      .catch((error) => error)

    expect(failure).toBeInstanceOf(TRPCClientError)
    expect(failure.data.code).toBe('UNAUTHORIZED')
  })

  it('uses the injected fetch implementation', async () => {
    const fetchImplementation = vi.fn(async () =>
      Response.json({ result: { data: null } }),
    ) as unknown as typeof fetch
    const client = createApiClient({
      baseUrl: TEST_API_BASE_URL,
      getToken: async () => null,
      fetch: fetchImplementation,
    })

    await client.checkIn.latestForDate.query({ localDate: '2026-10-19' })

    expect(fetchImplementation).toHaveBeenCalledTimes(1)
  })
})

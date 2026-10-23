import { HttpResponse, http } from 'msw/http'
import { API, TRPC_ERROR_CODES, type TrpcErrorCode } from '../../src'
import { TEST_API_BASE_URL } from './test-constants'

type Resolver = (input: unknown) => unknown

const TRPC_URL = `${TEST_API_BASE_URL}${API.TRPC_PATH}`

// JSON-RPC error numbers tRPC maps its error codes to.
const JSON_RPC_CODES: Record<TrpcErrorCode, number> = {
  [TRPC_ERROR_CODES.UNAUTHORIZED]: -32001,
  [TRPC_ERROR_CODES.BAD_REQUEST]: -32600,
  [TRPC_ERROR_CODES.NOT_FOUND]: -32004,
  [TRPC_ERROR_CODES.TOO_MANY_REQUESTS]: -32029,
  [TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR]: -32603,
}

const QUERY_INPUT_PARAMETER = 'input'

// Answers a tRPC query (GET with the JSON input in the `input` search parameter) with `{ result: { data } }`.
export function mockQuery(path: string, resolver: Resolver) {
  return http.get(`${TRPC_URL}/${path}`, ({ request }) => {
    const rawInput = new URL(request.url).searchParams.get(QUERY_INPUT_PARAMETER)
    const input = rawInput === null ? undefined : JSON.parse(rawInput)
    return HttpResponse.json({ result: { data: resolver(input) } })
  })
}

// Answers a tRPC mutation (POST with the JSON input as body) with `{ result: { data } }`.
export function mockMutation(path: string, resolver: Resolver) {
  return http.post(`${TRPC_URL}/${path}`, async ({ request }) => {
    const input = await request.json()
    return HttpResponse.json({ result: { data: resolver(input) } })
  })
}

// Fails any tRPC call (query or mutation) on `path` with the given error code and HTTP status.
export function mockTrpcError(path: string, code: TrpcErrorCode, httpStatus: number) {
  const body = {
    error: { message: code, code: JSON_RPC_CODES[code], data: { code, httpStatus, path } },
  }
  return http.all(`${TRPC_URL}/${path}`, () => HttpResponse.json(body, { status: httpStatus }))
}

export const API = Object.freeze({
  TRPC_PATH: '/trpc',
  AUTHORIZATION_HEADER: 'Authorization',
  BEARER_PREFIX: 'Bearer ',
})

// Error codes tRPC puts in `error.data.code`.
export const TRPC_ERROR_CODES = Object.freeze({
  UNAUTHORIZED: 'UNAUTHORIZED',
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
})

// The Worker rate limiter answers 429 with a plain JSON body that carries no tRPC error code.
export const HTTP_STATUS = Object.freeze({
  TOO_MANY_REQUESTS: 429,
})

export const QUERY_CLIENT = Object.freeze({
  STALE_TIME_MILLISECONDS: 30_000,
  MAXIMUM_RETRIES: 2,
  // Retrying these can never succeed: the session is gone, the input is wrong, the record does not exist or the caller is throttled.
  NON_RETRYABLE_ERROR_CODES: Object.freeze([
    TRPC_ERROR_CODES.UNAUTHORIZED,
    TRPC_ERROR_CODES.BAD_REQUEST,
    TRPC_ERROR_CODES.NOT_FOUND,
    TRPC_ERROR_CODES.TOO_MANY_REQUESTS,
  ] as string[]),
})

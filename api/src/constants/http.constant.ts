export const HTTP_PATHS = Object.freeze({
  HEALTH: '/health',
  TRPC: '/trpc',
})

export const HTTP_STATUS = Object.freeze({
  OK: 'ok',
})

export const HTTP_ERRORS = Object.freeze({
  NOT_FOUND: 'not_found',
  INTERNAL: 'internal_error',
  RATE_LIMITED: 'rate_limited',
})

export const CORS_POLICY = Object.freeze({
  ALLOW_HEADERS: ['Authorization', 'Content-Type', 'Accept-Language'],
  ALLOW_METHODS: ['GET', 'POST', 'OPTIONS'],
})

export const CONTENT_SECURITY_POLICY_DEFAULT_SOURCE = "'none'"

export const ORIGIN_SEPARATOR = ','

export const AUTHORIZATION = Object.freeze({
  HEADER: 'authorization',
  BEARER_PREFIX: 'Bearer ',
})

export const RATE_LIMIT = Object.freeze({
  CLIENT_IP_HEADER: 'cf-connecting-ip',
  UNKNOWN_CLIENT_KEY: 'unknown',
  STATUS: 429,
})

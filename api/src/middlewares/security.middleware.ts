import { cors } from 'hono/cors'
import { createMiddleware } from 'hono/factory'
import { secureHeaders } from 'hono/secure-headers'
import type { ApplicationEnvironment } from '../@types/application.type'
import { getEnvironment } from '../configs/environment.config'
import { CONTENT_SECURITY_POLICY_DEFAULT_SOURCE, CORS_POLICY } from '../constants/http.constant'

// CORS is built per request because the allowed origins come from the bindings.
export const corsMiddleware = createMiddleware<ApplicationEnvironment>((context, next) => {
  const { corsAllowedOrigins } = getEnvironment(context.env)
  return cors({
    origin: (origin) => (corsAllowedOrigins.includes(origin) ? origin : null),
    allowHeaders: [...CORS_POLICY.ALLOW_HEADERS],
    allowMethods: [...CORS_POLICY.ALLOW_METHODS],
  })(context, next)
})

export const secureHeadersMiddleware = secureHeaders({
  contentSecurityPolicy: { defaultSrc: [CONTENT_SECURITY_POLICY_DEFAULT_SOURCE] },
})

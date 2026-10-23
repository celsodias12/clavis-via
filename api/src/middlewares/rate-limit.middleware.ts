import { createMiddleware } from 'hono/factory'
import type { ApplicationEnvironment } from '../@types/application.type'
import { HTTP_ERRORS, RATE_LIMIT } from '../constants/http.constant'

export const rateLimitMiddleware = createMiddleware<ApplicationEnvironment>(
  async (context, next) => {
    const key = context.req.header(RATE_LIMIT.CLIENT_IP_HEADER) ?? RATE_LIMIT.UNKNOWN_CLIENT_KEY
    const { success } = await context.env.RATE_LIMITER.limit({ key })
    if (!success) {
      return context.json({ error: HTTP_ERRORS.RATE_LIMITED }, RATE_LIMIT.STATUS)
    }
    await next()
  },
)

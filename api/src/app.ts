import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import type { ApplicationEnvironment } from './@types/application.type'
import { createTrpcContext, logTrpcError } from './configs/trpc.config'
import { HTTP_PATHS } from './constants/http.constant'
import { handleApplicationError, handleNotFound } from './middlewares/error.middleware'
import { rateLimitMiddleware } from './middlewares/rate-limit.middleware'
import { corsMiddleware, secureHeadersMiddleware } from './middlewares/security.middleware'
import { appRouter } from './routes/app.route'
import { healthRoute } from './routes/health.route'

export const app = new Hono<ApplicationEnvironment>()

app.use(logger())
app.use(secureHeadersMiddleware)
app.use(corsMiddleware)
app.use(rateLimitMiddleware)
app.use(
  `${HTTP_PATHS.TRPC}/*`,
  trpcServer({
    endpoint: HTTP_PATHS.TRPC,
    router: appRouter,
    createContext: createTrpcContext,
    onError: logTrpcError,
  }),
)
app.route(HTTP_PATHS.HEALTH, healthRoute)
app.notFound(handleNotFound)
app.onError(handleApplicationError)

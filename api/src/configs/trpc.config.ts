import { initTRPC, TRPCError } from '@trpc/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import type { Context } from 'hono'
import type { ApplicationEnvironment, TrpcContext } from '../@types/application.type'
import { AUTHORIZATION, HTTP_ERRORS } from '../constants/http.constant'
import { TRPC_ERRORS, TRPC_LOG_EVENT } from '../constants/trpc.constant'
import { resolveRequestLanguage } from '../i18n/language'
import { extractBearerToken } from '../utils/authorization'
import { verifySessionToken } from './clerk.config'
import { createDatabase } from './d1.config'
import { getEnvironment } from './environment.config'

export type { TrpcContext }

// Resolves the Clerk user from the Authorization header; userId stays null when absent or invalid.
export async function createTrpcContext(
  options: FetchCreateContextFnOptions,
  context: Context<ApplicationEnvironment>,
): Promise<TrpcContext> {
  const token = extractBearerToken(options.req.headers.get(AUTHORIZATION.HEADER) ?? undefined)
  const userId = token
    ? await verifySessionToken(token, getEnvironment(context.env).clerkJwtKey)
    : null
  return {
    userId,
    language: resolveRequestLanguage(options.req.headers.get('accept-language')),
    bindings: context.env,
    database: createDatabase(context.env.DB),
  }
}

// isDev false: NODE_ENV does not exist in a Worker, and tRPC would otherwise return error stacks.
// The formatter also hides the message of unexpected failures: tRPC copies the message of the
// wrapped cause, and a Drizzle/D1 error message carries the SQL and its parameters.
const trpc = initTRPC.context<TrpcContext>().create({
  isDev: false,
  errorFormatter: ({ shape, error }) =>
    error.code === TRPC_ERRORS.INTERNAL_SERVER_ERROR
      ? { ...shape, message: HTTP_ERRORS.INTERNAL }
      : shape,
})

// Unexpected failures go to Workers Logs; expected ones (BAD_REQUEST, UNAUTHORIZED) are not logged.
export function logTrpcError({ error, path }: { error: TRPCError; path: string | undefined }) {
  if (error.code !== TRPC_ERRORS.INTERNAL_SERVER_ERROR) {
    return
  }
  console.error({
    event: TRPC_LOG_EVENT.INTERNAL_ERROR,
    path,
    message: error.message,
    stack: error.stack,
    cause: error.cause,
  })
}

export const router = trpc.router
export const createCallerFactory = trpc.createCallerFactory
export const publicProcedure = trpc.procedure

export const protectedProcedure = trpc.procedure.use(({ ctx, next }) => {
  if (ctx.userId === null) {
    throw new TRPCError({ code: TRPC_ERRORS.UNAUTHORIZED })
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } })
})

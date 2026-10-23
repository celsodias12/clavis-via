import { env } from 'cloudflare:workers'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import type { Context } from 'hono'
import { describe, expect, it } from 'vitest'
import { signSessionToken } from '../../tests/utils/session-token'
import type { ApplicationEnvironment } from '../@types/application.type'
import { createDatabase } from './d1.config'
import {
  createCallerFactory,
  createTrpcContext,
  protectedProcedure,
  publicProcedure,
  router,
} from './trpc.config'

const USER_ID = 'user_1'
const database = createDatabase(env.DB)

const testRouter = router({
  whoAmI: protectedProcedure.query(({ ctx }) => ctx.userId),
  open: publicProcedure.query(() => 'open'),
})
const createCaller = createCallerFactory(testRouter)

function contextFor(headers: Record<string, string>) {
  const options = {
    req: new Request('https://api.test/trpc/whoAmI', { headers }),
  } as FetchCreateContextFnOptions
  return createTrpcContext(options, { env } as Context<ApplicationEnvironment>)
}

describe('protectedProcedure', () => {
  it('rejects a request without a user', async () => {
    await expect(
      createCaller({ userId: null, language: 'pt-BR', bindings: env, database }).whoAmI(),
    ).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
  })

  it('exposes the user id to the procedure', async () => {
    expect(
      await createCaller({ userId: USER_ID, language: 'pt-BR', bindings: env, database }).whoAmI(),
    ).toBe(USER_ID)
  })

  it('lets a public procedure run without a user', async () => {
    expect(
      await createCaller({ userId: null, language: 'pt-BR', bindings: env, database }).open(),
    ).toBe('open')
  })
})

describe('createTrpcContext', () => {
  it('resolves the user id of a valid Bearer token', async () => {
    const token = await signSessionToken({ userId: USER_ID })
    const context = await contextFor({ Authorization: `Bearer ${token}` })
    expect(context.userId).toBe(USER_ID)
    expect(context.bindings).toBe(env)
  })

  it('leaves the user id null without the header', async () => {
    expect((await contextFor({})).userId).toBeNull()
  })

  it('selects the content language from Accept-Language', async () => {
    expect((await contextFor({ 'Accept-Language': 'es-MX,pt-BR;q=0.8' })).language).toBe('es')
  })

  it('leaves the user id null for an invalid token', async () => {
    expect((await contextFor({ Authorization: 'Bearer nope' })).userId).toBeNull()
  })
})

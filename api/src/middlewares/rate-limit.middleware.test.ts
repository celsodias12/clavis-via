import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import type { ApplicationEnvironment } from '../@types/application.type'
import { rateLimitMiddleware } from './rate-limit.middleware'

const BLOCKED_KEY = 'blocked-ip'

function createTestApp() {
  const receivedKeys: string[] = []
  const bindings = {
    RATE_LIMITER: {
      limit: async ({ key }: { key: string }) => {
        receivedKeys.push(key)
        return { success: key !== BLOCKED_KEY }
      },
    },
  } as unknown as Cloudflare.Env
  const testApp = new Hono<ApplicationEnvironment>()
  testApp.use(rateLimitMiddleware)
  testApp.get('/', (context) => context.text('ok'))
  const request = (headers: Record<string, string>) => testApp.request('/', { headers }, bindings)
  return { request, receivedKeys }
}

describe('rateLimitMiddleware', () => {
  it('answers 429 when the limiter blocks the client', async () => {
    const { request } = createTestApp()
    const response = await request({ 'cf-connecting-ip': BLOCKED_KEY })
    expect(response.status).toBe(429)
    expect(await response.json()).toEqual({ error: 'rate_limited' })
  })

  it('lets other clients through', async () => {
    const { request } = createTestApp()
    const response = await request({ 'cf-connecting-ip': '1.2.3.4' })
    expect(response.status).toBe(200)
  })

  it('uses the unknown key without the client IP header', async () => {
    const { request, receivedKeys } = createTestApp()
    await request({})
    expect(receivedKeys).toEqual(['unknown'])
  })
})

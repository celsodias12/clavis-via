import { env } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'
import { getEnvironment } from './environment.config'

describe('getEnvironment', () => {
  it('splits and trims the allowed origins', () => {
    const environment = getEnvironment({
      ...env,
      CORS_ALLOWED_ORIGINS: 'https://a.test, https://b.test',
    })
    expect(environment.corsAllowedOrigins).toEqual(['https://a.test', 'https://b.test'])
  })

  it('turns an empty string into no origins', () => {
    expect(getEnvironment({ ...env, CORS_ALLOWED_ORIGINS: '' }).corsAllowedOrigins).toEqual([])
  })

  it('rejects an origin that is not a URL', () => {
    expect(() => getEnvironment({ ...env, CORS_ALLOWED_ORIGINS: 'not a url' })).toThrow()
  })

  it('rejects a missing Clerk JWT key', () => {
    expect(() => getEnvironment({ ...env, CLERK_JWT_KEY: '' })).toThrow()
  })

  it('exposes the Clerk JWT key', () => {
    expect(getEnvironment(env).clerkJwtKey).toBe(env.CLERK_JWT_KEY)
  })

  it('coerces the mock reply delay to a number', () => {
    expect(getEnvironment({ ...env, MOCK_REPLY_DELAY_MILLISECONDS: '900' })).toMatchObject({
      mockReplyDelayMilliseconds: 900,
    })
  })

  it('rejects a negative or non numeric mock reply delay', () => {
    expect(() => getEnvironment({ ...env, MOCK_REPLY_DELAY_MILLISECONDS: '-1' })).toThrow()
    expect(() => getEnvironment({ ...env, MOCK_REPLY_DELAY_MILLISECONDS: 'slow' })).toThrow()
  })
})

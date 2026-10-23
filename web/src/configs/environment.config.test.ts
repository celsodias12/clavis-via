import { describe, expect, it } from 'vite-plus/test'
import { environment, parseEnvironment } from './environment.config'

describe('parseEnvironment', () => {
  it('maps the public variables to typed fields', () => {
    expect(
      parseEnvironment({
        VITE_API_BASE_URL: 'http://localhost:8787',
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_x',
      }),
    ).toEqual({ apiBaseUrl: 'http://localhost:8787', clerkPublishableKey: 'pk_test_x' })
  })

  it('rejects a missing API URL', () => {
    expect(() => parseEnvironment({ VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_x' })).toThrow()
  })

  it('rejects an API URL that is not a URL', () => {
    expect(() =>
      parseEnvironment({ VITE_API_BASE_URL: 'not-a-url', VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_x' }),
    ).toThrow()
  })

  it('rejects a missing Clerk publishable key', () => {
    expect(() => parseEnvironment({ VITE_API_BASE_URL: 'http://api.test' })).toThrow()
  })

  it('rejects unknown variables', () => {
    expect(() =>
      parseEnvironment({
        VITE_API_BASE_URL: 'http://api.test',
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_x',
        EXTRA: 'x',
      }),
    ).toThrow()
  })

  it('builds the exported environment from import.meta.env', () => {
    expect(environment).toEqual({
      apiBaseUrl: 'http://api.test',
      clerkPublishableKey: 'pk_test_vitest',
    })
  })
})

import { environment, parseEnvironment } from './environment.config'

describe('parseEnvironment', () => {
  it('maps the public variables to typed fields', () => {
    expect(
      parseEnvironment({
        EXPO_PUBLIC_API_BASE_URL: 'http://10.0.2.2:8787',
        EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_x',
      }),
    ).toEqual({ apiBaseUrl: 'http://10.0.2.2:8787', clerkPublishableKey: 'pk_test_x' })
  })

  it('rejects an invalid API URL', () => {
    expect(() =>
      parseEnvironment({
        EXPO_PUBLIC_API_BASE_URL: 'not-a-url',
        EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_x',
      }),
    ).toThrow()
  })

  it('rejects unknown variables', () => {
    expect(() =>
      parseEnvironment({
        EXPO_PUBLIC_API_BASE_URL: 'http://api.test',
        EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_x',
        EXTRA: 'x',
      }),
    ).toThrow()
  })

  it('builds the exported environment from process.env', () => {
    expect(environment).toEqual({
      apiBaseUrl: 'http://api.test',
      clerkPublishableKey: 'pk_test_jest',
    })
  })
})

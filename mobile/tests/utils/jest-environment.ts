// Test-only values for the public environment variables read by configs/environment.config.ts.
process.env.EXPO_PUBLIC_API_BASE_URL = 'http://api.test'
process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_jest'

type NodeFetchGlobals = { __NODE_FETCH_GLOBALS__: Record<string, unknown> }

// Put Node's fetch API back (see test-environment.js) so MSW can intercept requests and build responses.
for (const [name, value] of Object.entries(
  (globalThis as unknown as NodeFetchGlobals).__NODE_FETCH_GLOBALS__,
)) {
  Object.defineProperty(globalThis, name, { value, writable: true, configurable: true })
}

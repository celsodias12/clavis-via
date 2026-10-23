import { exports } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'

const BASE_URL = 'https://api.test'
const ALLOWED_ORIGIN = 'https://allowed.test'
const OTHER_ORIGIN = 'https://other.test'

function preflight(origin: string) {
  return exports.default.fetch(`${BASE_URL}/health`, {
    method: 'OPTIONS',
    headers: { Origin: origin, 'Access-Control-Request-Method': 'GET' },
  })
}

describe('api base', () => {
  it('answers the health check', async () => {
    const response = await exports.default.fetch(`${BASE_URL}/health`)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok' })
  })

  it('sends the security headers', async () => {
    const response = await exports.default.fetch(`${BASE_URL}/health`)
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    expect(response.headers.get('content-security-policy')).toBe("default-src 'none'")
    await response.text()
  })

  it('answers unknown paths with a JSON 404', async () => {
    const response = await exports.default.fetch(`${BASE_URL}/nothing-here`)
    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'not_found' })
  })

  it('allows only configured origins', async () => {
    const allowed = await preflight(ALLOWED_ORIGIN)
    expect(allowed.headers.get('access-control-allow-origin')).toBe(ALLOWED_ORIGIN)
    expect(allowed.headers.get('access-control-allow-headers')).toBe(
      'Authorization,Content-Type,Accept-Language',
    )

    const other = await preflight(OTHER_ORIGIN)
    expect(other.headers.get('access-control-allow-origin')).toBeNull()
  })
})

describe('trpc mount', () => {
  it('answers an unknown procedure with a JSON error and no stack', async () => {
    const response = await exports.default.fetch(`${BASE_URL}/trpc/missing`)
    expect(response.status).toBe(404)
    expect(JSON.stringify(await response.json())).not.toContain('stack')
  })
})

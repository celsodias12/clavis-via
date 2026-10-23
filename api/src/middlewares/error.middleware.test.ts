import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import { handleApplicationError } from './error.middleware'

describe('handleApplicationError', () => {
  it('answers 500 with a generic body and logs the error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const app = new Hono()
    app.onError(handleApplicationError)
    app.get('/boom', () => {
      throw new Error('secret detail')
    })

    const response = await app.request('/boom')
    const text = await response.text()

    expect(response.status).toBe(500)
    expect(JSON.parse(text)).toEqual({ error: 'internal_error' })
    expect(text).not.toContain('secret detail')
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})

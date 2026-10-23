import { reset } from 'cloudflare:test'
import { exports } from 'cloudflare:workers'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applyMigrations } from '../utils/apply-migrations'
import { signSessionToken } from '../utils/session-token'

const BASE_URL = 'https://api.test/trpc'
// The server only accepts dates within one day of its own UTC date.
const LOCAL_DATE = new Date().toISOString().slice(0, 10)

async function authorizationHeaders() {
  const token = await signSessionToken({ userId: 'user_1' })
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function create(body: unknown, headers: Record<string, string>) {
  return exports.default.fetch(`${BASE_URL}/checkIn.create`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

beforeEach(async () => {
  await reset()
  await applyMigrations()
})

describe('checkIn routes', () => {
  it('rejects a create without a token', async () => {
    const response = await create(
      { state: 'anxious', localDate: LOCAL_DATE },
      { 'Content-Type': 'application/json' },
    )
    expect(response.status).toBe(401)
    await response.text()
  })

  it('creates a check-in and returns it with the daily key', async () => {
    const headers = await authorizationHeaders()
    const created = await create({ state: 'anxious', localDate: LOCAL_DATE }, headers)
    expect(created.status).toBe(200)
    await created.text()

    const input = encodeURIComponent(JSON.stringify({ localDate: LOCAL_DATE }))
    const response = await exports.default.fetch(
      `${BASE_URL}/checkIn.latestForDate?input=${input}`,
      { headers },
    )
    expect(response.status).toBe(200)
    const body = (await response.json()) as { result: { data: { dailyKey: { title: string } } } }
    expect(body.result.data.dailyKey.title).toBe('Voz e Limites')
  })

  it('responds in the requested language for the same stored check-in', async () => {
    const headers = await authorizationHeaders()
    const created = await create({ state: 'anxious', localDate: LOCAL_DATE }, headers)
    expect(created.status).toBe(200)
    await created.text()

    const input = encodeURIComponent(JSON.stringify({ localDate: LOCAL_DATE }))
    for (const [language, title] of [
      ['en-US', 'Voice and boundaries'],
      ['es-MX', 'Voz y límites'],
    ] as const) {
      const response = await exports.default.fetch(
        `${BASE_URL}/checkIn.latestForDate?input=${input}`,
        { headers: { ...headers, 'Accept-Language': language } },
      )
      expect(response.status).toBe(200)
      const body = (await response.json()) as { result: { data: { dailyKey: { title: string } } } }
      expect(body.result.data.dailyKey.title).toBe(title)
    }
  })

  it('answers invalid input with BAD_REQUEST and no stack', async () => {
    const response = await create(
      { state: 'other', localDate: LOCAL_DATE },
      await authorizationHeaders(),
    )
    expect(response.status).toBe(400)
    const text = await response.text()
    expect(text).toContain('BAD_REQUEST')
    expect(text).not.toContain('stack')
  })

  it('answers an unexpected failure with a generic message and logs the cause', async () => {
    // Without migrations the insert fails inside D1, like a real database outage.
    await reset()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const response = await create(
      { state: 'anxious', localDate: LOCAL_DATE },
      await authorizationHeaders(),
    )
    expect(response.status).toBe(500)
    const text = await response.text()
    expect(text).toContain('INTERNAL_SERVER_ERROR')
    expect(text).not.toContain('check_ins')
    expect(text).not.toContain('insert')
    expect(consoleError).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'trpc_internal_error', path: 'checkIn.create' }),
    )
    consoleError.mockRestore()
  })

  it('does not log expected errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const response = await create(
      { state: 'anxious', localDate: LOCAL_DATE },
      { 'Content-Type': 'application/json' },
    )
    await response.text()
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('rejects a local date outside the server date window', async () => {
    const response = await create(
      { state: 'anxious', localDate: '2020-01-01' },
      await authorizationHeaders(),
    )
    expect(response.status).toBe(400)
    expect(await response.text()).toContain('local_date_out_of_range')
  })
})

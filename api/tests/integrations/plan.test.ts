import { reset } from 'cloudflare:test'
import { exports } from 'cloudflare:workers'
import { beforeEach, describe, expect, it } from 'vitest'
import { applyMigrations } from '../utils/apply-migrations'
import { signSessionToken } from '../utils/session-token'

const BASE_URL = 'https://api.test/trpc'
const PLAN_ID = 'when-discouragement-weighs'

async function authorizationHeaders() {
  const token = await signSessionToken({ userId: 'user_1' })
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

beforeEach(async () => {
  await reset()
  await applyMigrations()
})

describe('plan routes', () => {
  it('rejects a list without a token', async () => {
    const response = await exports.default.fetch(`${BASE_URL}/plan.list`)
    expect(response.status).toBe(401)
    await response.text()
  })

  it('lists the plans', async () => {
    const response = await exports.default.fetch(`${BASE_URL}/plan.list`, {
      headers: await authorizationHeaders(),
    })
    expect(response.status).toBe(200)
    const body = (await response.json()) as { result: { data: { id: string }[] } }
    expect(body.result.data).toHaveLength(5)
  })

  it('completes a day and shows it as the current plan', async () => {
    const headers = await authorizationHeaders()
    const completed = await exports.default.fetch(`${BASE_URL}/plan.completeDay`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ planId: PLAN_ID, dayNumber: 1, reflection: 'Respirei.' }),
    })
    expect(completed.status).toBe(200)
    await completed.text()

    const response = await exports.default.fetch(`${BASE_URL}/plan.current`, { headers })
    expect(response.status).toBe(200)
    const body = (await response.json()) as {
      result: { data: { planId: string; completedDays: number; nextDayNumber: number } }
    }
    expect(body.result.data).toMatchObject({
      planId: PLAN_ID,
      completedDays: 1,
      nextDayNumber: 2,
    })
  })

  it('serves detail and day and starts a plan', async () => {
    const headers = await authorizationHeaders()
    const detailInput = encodeURIComponent(JSON.stringify({ planId: PLAN_ID }))
    const detail = await exports.default.fetch(`${BASE_URL}/plan.detail?input=${detailInput}`, {
      headers,
    })
    expect(detail.status).toBe(200)
    await detail.text()

    const dayInput = encodeURIComponent(JSON.stringify({ planId: PLAN_ID, dayNumber: 1 }))
    const day = await exports.default.fetch(`${BASE_URL}/plan.day?input=${dayInput}`, { headers })
    expect(day.status).toBe(200)
    await day.text()

    const started = await exports.default.fetch(`${BASE_URL}/plan.start`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ planId: PLAN_ID }),
    })
    expect(started.status).toBe(200)
    await started.text()
  })

  it('answers NOT_FOUND with HTTP 404 for an unknown plan', async () => {
    const input = encodeURIComponent(JSON.stringify({ planId: 'nope' }))
    const response = await exports.default.fetch(`${BASE_URL}/plan.detail?input=${input}`, {
      headers: await authorizationHeaders(),
    })
    expect(response.status).toBe(404)
    expect(await response.text()).toContain('NOT_FOUND')
  })
})

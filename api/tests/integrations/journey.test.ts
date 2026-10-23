import { reset } from 'cloudflare:test'
import { exports } from 'cloudflare:workers'
import { beforeEach, describe, expect, it } from 'vitest'
import { applyMigrations } from '../utils/apply-migrations'
import { signSessionToken } from '../utils/session-token'

const BASE_URL = 'https://api.test/trpc'

function todayLocalDate() {
  return new Date().toISOString().slice(0, 10)
}

async function authorizationHeaders(userId = 'user_1') {
  const token = await signSessionToken({ userId })
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function queryUrl(path: string, input: unknown) {
  return `${BASE_URL}/${path}?input=${encodeURIComponent(JSON.stringify(input))}`
}

beforeEach(async () => {
  await reset()
  await applyMigrations()
})

describe('journey routes', () => {
  it('rejects the overview without a token', async () => {
    const response = await exports.default.fetch(
      queryUrl('journey.overview', { localDate: todayLocalDate() }),
    )
    expect(response.status).toBe(401)
    await response.text()
  })

  it('returns only the data of the signed-in user', async () => {
    const localDate = todayLocalDate()
    const headers = await authorizationHeaders()
    const checkIn = await exports.default.fetch(`${BASE_URL}/checkIn.create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ state: 'at-peace', localDate }),
    })
    expect(checkIn.status).toBe(200)
    await checkIn.text()

    const response = await exports.default.fetch(queryUrl('journey.overview', { localDate }), {
      headers,
    })
    expect(response.status).toBe(200)
    const body = (await response.json()) as {
      result: { data: { streakDays: number; achievements: { kind: string }[] } }
    }
    expect(body.result.data.streakDays).toBe(1)
    expect(body.result.data.achievements).toEqual([{ kind: 'weekly-check-ins', count: 1 }])

    const other = await exports.default.fetch(queryUrl('journey.overview', { localDate }), {
      headers: await authorizationHeaders('user_2'),
    })
    const otherBody = (await other.json()) as { result: { data: { streakDays: number } } }
    expect(otherBody.result.data.streakDays).toBe(0)
  })

  it('serves practice, verse and emotion procedures', async () => {
    const localDate = todayLocalDate()
    const headers = await authorizationHeaders()

    const practice = await exports.default.fetch(
      queryUrl('practice.byId', { practiceId: 'guided-breathing' }),
      { headers },
    )
    expect(practice.status).toBe(200)
    await practice.text()

    const completed = await exports.default.fetch(`${BASE_URL}/practice.complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ practiceId: 'guided-breathing', localDate }),
    })
    expect(completed.status).toBe(200)
    await completed.text()

    const verse = await exports.default.fetch(queryUrl('verse.ofDay', { localDate }), { headers })
    expect(verse.status).toBe(200)
    await verse.text()

    const emotion = await exports.default.fetch(
      queryUrl('emotion.summary', { period: 'week', localDate }),
      { headers },
    )
    expect(emotion.status).toBe(200)
    const body = (await emotion.json()) as { result: { data: { points: unknown[] } } }
    expect(body.result.data.points).toHaveLength(7)
  })
})

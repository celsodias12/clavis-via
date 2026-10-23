import { reset } from 'cloudflare:test'
import { exports } from 'cloudflare:workers'
import { beforeEach, describe, expect, it } from 'vitest'
import { applyMigrations } from '../utils/apply-migrations'
import { signSessionToken } from '../utils/session-token'

const BASE_URL = 'https://api.test/trpc'

async function authorizationHeaders(userId = 'user_1') {
  const token = await signSessionToken({ userId })
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function send(headers: Record<string, string>, body: unknown) {
  return exports.default.fetch(`${BASE_URL}/conversation.send`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

const LOCAL_DATE = new Date().toISOString().slice(0, 10)

beforeEach(async () => {
  await reset()
  await applyMigrations()
})

describe('conversation routes', () => {
  it('rejects a send and a list without a token', async () => {
    const sent = await exports.default.fetch(`${BASE_URL}/conversation.send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Oi', localDate: LOCAL_DATE }),
    })
    expect(sent.status).toBe(401)
    await sent.text()
    const listed = await exports.default.fetch(`${BASE_URL}/conversation.list`)
    expect(listed.status).toBe(401)
    await listed.text()
  })

  it('answers a message with the simulated reply and lists the conversation', async () => {
    const headers = await authorizationHeaders()
    const response = await send(headers, {
      text: 'Quero conversar',
      localDate: LOCAL_DATE,
      intent: 'talk',
    })
    expect(response.status).toBe(200)
    const body = (await response.json()) as {
      result: { data: { userMessage: { text: string }; assistantMessage: { text: string } } }
    }
    expect(body.result.data.userMessage.text).toBe('Quero conversar')
    expect(body.result.data.assistantMessage.text).toContain('Estou aqui para ouvir')

    const listed = await exports.default.fetch(`${BASE_URL}/conversation.list`, { headers })
    const list = (await listed.json()) as { result: { data: { role: string }[] } }
    expect(list.result.data.map((message) => message.role)).toEqual(['user', 'assistant'])
  })

  it('replies in the requested language and keeps each language history separate', async () => {
    const authorization = await authorizationHeaders()
    const englishHeaders = { ...authorization, 'Accept-Language': 'en-US' }
    const spanishHeaders = { ...authorization, 'Accept-Language': 'es-ES' }
    const input = { text: 'I want to talk', localDate: LOCAL_DATE, intent: 'talk' }

    const englishResponse = await send(englishHeaders, input)
    expect(englishResponse.status).toBe(200)
    const english = (await englishResponse.json()) as {
      result: { data: { assistantMessage: { text: string } } }
    }
    expect(english.result.data.assistantMessage.text).toContain('I am here to listen')

    const spanishResponse = await send(spanishHeaders, { ...input, text: 'Quiero hablar' })
    expect(spanishResponse.status).toBe(200)
    const spanish = (await spanishResponse.json()) as {
      result: { data: { assistantMessage: { text: string } } }
    }
    expect(spanish.result.data.assistantMessage.text).toContain('Estoy aquí para escucharte')

    for (const [headers, expected] of [
      [englishHeaders, 'I want to talk'],
      [spanishHeaders, 'Quiero hablar'],
    ] as const) {
      const listed = await exports.default.fetch(`${BASE_URL}/conversation.list`, { headers })
      expect(listed.status).toBe(200)
      const body = (await listed.json()) as {
        result: { data: { text: string }[] }
      }
      expect(body.result.data).toHaveLength(2)
      expect(body.result.data[0].text).toBe(expected)
    }
  })

  it('answers a blank message with HTTP 400', async () => {
    const response = await send(await authorizationHeaders(), {
      text: '   ',
      localDate: LOCAL_DATE,
    })
    expect(response.status).toBe(400)
    await response.text()
  })

  it('answers the 31st message in a day with HTTP 429', async () => {
    const headers = await authorizationHeaders()
    for (let sent = 0; sent < 30; sent += 1) {
      const response = await send(headers, { text: `mensagem ${sent}`, localDate: LOCAL_DATE })
      expect(response.status).toBe(200)
      await response.text()
    }
    const refused = await send(headers, { text: 'mais uma', localDate: LOCAL_DATE })
    expect(refused.status).toBe(429)
    expect(await refused.text()).toContain('TOO_MANY_REQUESTS')
  })
})

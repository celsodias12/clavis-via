import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createClerkApi } from './clerk-api.ts'

const SECRET = 'sk_test_secret_value'

type Call = { url: string; init: RequestInit }

function fakeFetch(status: number, body: unknown) {
  const calls: Call[] = []
  const implementation = (async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    return new Response(body === undefined ? 'not-json' : JSON.stringify(body), { status })
  }) as unknown as typeof fetch
  return { calls, api: createClerkApi({ secretKey: SECRET, fetch: implementation }) }
}

const rawUser = {
  id: 'user_1',
  first_name: 'Ana',
  email_addresses: [{ email_address: 'ana@example.com' }],
}
const expectedUser = { id: 'user_1', firstName: 'Ana', emailAddresses: ['ana@example.com'] }

test('findUserByEmail sends an encoded GET with the bearer key', async () => {
  const { calls, api } = fakeFetch(200, [rawUser])
  assert.deepEqual(await api.findUserByEmail('ana+x@example.com'), expectedUser)
  assert.equal(calls[0].url, 'https://api.clerk.com/v1/users?email_address=ana%2Bx%40example.com')
  assert.equal((calls[0].init.headers as Record<string, string>).Authorization, `Bearer ${SECRET}`)
})

test('findUserByEmail returns null when nothing matches', async () => {
  const { api } = fakeFetch(200, [])
  assert.equal(await api.findUserByEmail('none@example.com'), null)
})

test('listUsers queries by text', async () => {
  const { calls, api } = fakeFetch(200, [rawUser])
  assert.deepEqual(await api.listUsers({ query: 'ana x' }), [expectedUser])
  assert.equal(calls[0].url, 'https://api.clerk.com/v1/users?query=ana%20x')
})

test('listUsers passes limit and offset when given', async () => {
  const { calls, api } = fakeFetch(200, [rawUser])
  await api.listUsers({ query: 'ana', limit: 500, offset: 1000 })
  assert.equal(calls[0].url, 'https://api.clerk.com/v1/users?query=ana&limit=500&offset=1000')
})

test('listUsers passes each paging option on its own', async () => {
  const { calls, api } = fakeFetch(200, [rawUser])
  await api.listUsers({ query: 'ana', limit: 5 })
  await api.listUsers({ query: 'ana', offset: 10 })
  assert.equal(calls[0].url, 'https://api.clerk.com/v1/users?query=ana&limit=5')
  assert.equal(calls[1].url, 'https://api.clerk.com/v1/users?query=ana&offset=10')
})

test('listAllUsers pages with offset until a short page', async () => {
  const urls: string[] = []
  const pages = [Array(500).fill(rawUser), Array(500).fill(rawUser), [rawUser]]
  const implementation = (async (url: string) => {
    urls.push(url)
    return new Response(JSON.stringify(pages[urls.length - 1]), { status: 200 })
  }) as unknown as typeof fetch
  const api = createClerkApi({ secretKey: SECRET, fetch: implementation })
  assert.equal((await api.listAllUsers({ query: 'e2e' })).length, 1001)
  assert.deepEqual(urls, [
    'https://api.clerk.com/v1/users?query=e2e&limit=500&offset=0',
    'https://api.clerk.com/v1/users?query=e2e&limit=500&offset=500',
    'https://api.clerk.com/v1/users?query=e2e&limit=500&offset=1000',
  ])
})

test('listAllUsers stops after a single empty page', async () => {
  const { calls, api } = fakeFetch(200, [])
  assert.deepEqual(await api.listAllUsers({ query: 'e2e' }), [])
  assert.equal(calls.length, 1)
})

test('updateUserPassword patches only the password', async () => {
  const { calls, api } = fakeFetch(200, rawUser)
  await api.updateUserPassword('user_1', 'one-time')
  assert.equal(calls[0].url, 'https://api.clerk.com/v1/users/user_1')
  assert.equal(calls[0].init.method, 'PATCH')
  assert.deepEqual(JSON.parse(calls[0].init.body as string), { password: 'one-time' })
})

test('createUser posts the snake_case payload', async () => {
  const { calls, api } = fakeFetch(200, rawUser)
  assert.deepEqual(
    await api.createUser({ email: 'ana@example.com', password: 'pw', firstName: 'Ana' }),
    expectedUser,
  )
  assert.equal(calls[0].url, 'https://api.clerk.com/v1/users')
  assert.equal(calls[0].init.method, 'POST')
  assert.deepEqual(JSON.parse(calls[0].init.body as string), {
    email_address: ['ana@example.com'],
    password: 'pw',
    first_name: 'Ana',
  })
})

test('setProfileImage posts multipart with the file field', async () => {
  const { calls, api } = fakeFetch(200, {})
  await api.setProfileImage('user_1', new Blob(['x'], { type: 'image/jpeg' }))
  assert.equal(calls[0].url, 'https://api.clerk.com/v1/users/user_1/profile_image')
  const form = calls[0].init.body as FormData
  assert.ok(form instanceof FormData)
  assert.ok(form.get('file') instanceof Blob)
})

test('deleteUser sends DELETE and tolerates an unparsable body', async () => {
  const { calls, api } = fakeFetch(200, undefined)
  await api.deleteUser('user_1')
  assert.equal(calls[0].init.method, 'DELETE')
  assert.equal(calls[0].url, 'https://api.clerk.com/v1/users/user_1')
})

test('a failed response throws status and code, never the key', async () => {
  const { api } = fakeFetch(422, { errors: [{ code: 'form_identifier_exists' }] })
  await assert.rejects(api.findUserByEmail('a@b.c'), (error: Error) => {
    assert.match(error.message, /422/)
    assert.match(error.message, /form_identifier_exists/)
    assert.ok(!error.message.includes(SECRET))
    return true
  })
})

test('a failed response without a parsable body reports an unknown code', async () => {
  const { api } = fakeFetch(500, undefined)
  await assert.rejects(api.deleteUser('user_1'), /500 \(unknown\)/)
})

test('a failed response with an empty error list reports an unknown code', async () => {
  const { api } = fakeFetch(400, { errors: [] })
  await assert.rejects(
    api.createUser({ email: 'a@b.c', password: 'p', firstName: 'A' }),
    /POST.*400 \(unknown\)/,
  )
})

test('createClerkApi falls back to the global fetch', () => {
  assert.equal(typeof createClerkApi({ secretKey: SECRET }).listUsers, 'function')
})

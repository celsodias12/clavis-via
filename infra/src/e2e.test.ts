import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { ClerkApi } from './@types/clerk.type.ts'
import {
  allowsCorsOrigin,
  buildLocalResetArguments,
  buildResetStatements,
  ensureE2EAccount,
  generateOneTimePassword,
  isResponding,
  isSignUpTestEmail,
  readEnvironmentValue,
  removeSignUpTestUsers,
  runCommand,
  signUpTestEmail,
} from './e2e.ts'

test('buildResetStatements emits one DELETE per table for the user', () => {
  const sql = buildResetStatements('user_3KwX8')
  const statements = sql.split(';').filter((statement) => statement.trim() !== '')
  assert.equal(statements.length, 5)
  for (const table of [
    'check_ins',
    'plan_enrollments',
    'day_completions',
    'practice_completions',
    'conversation_messages',
  ]) {
    assert.ok(sql.includes(`DELETE FROM ${table} WHERE user_id = 'user_3KwX8'`), table)
  }
})

test('buildResetStatements rejects an id that is not a Clerk user id', () => {
  assert.throws(() => buildResetStatements("user_1' OR 1=1 --"), /Invalid user id/)
  assert.throws(() => buildResetStatements(''), /Invalid user id/)
})

test('signUpTestEmail embeds the timestamp', () => {
  assert.equal(signUpTestEmail(1792496509833), 'e2e-signup-1792496509833+clerk_test@example.com')
})

test('isSignUpTestEmail only accepts sign-up test addresses', () => {
  assert.equal(isSignUpTestEmail(signUpTestEmail(1792496509833)), true)
  assert.equal(isSignUpTestEmail('ana@example.com'), false)
  assert.equal(isSignUpTestEmail('e2e-main+clerk_test@example.com'), false)
})

test('generateOneTimePassword is long, mixed and different every time', () => {
  const first = generateOneTimePassword()
  const second = generateOneTimePassword()
  assert.notEqual(first, second)
  assert.ok(first.length >= 32)
  assert.match(first, /[a-z]/)
  assert.match(first, /[A-Z]/)
  assert.match(first, /\d/)
  assert.match(first, /[^A-Za-z0-9]/)
})

function fakeClerkApi(overrides: Partial<ClerkApi> = {}): ClerkApi {
  return {
    findUserByEmail: async () => null,
    createUser: async () => ({ id: 'user_created', emailAddresses: [], firstName: null }),
    setProfileImage: async () => {},
    listUsers: async () => [],
    listAllUsers: async () => [],
    updateUserPassword: async () => {},
    deleteUser: async () => {},
    ...overrides,
  }
}

test('isResponding is true for an ok response and false for an error or a failure', async () => {
  assert.equal(await isResponding('http://x', async () => new Response('ok')), true)
  assert.equal(
    await isResponding('http://x', async () => new Response('no', { status: 500 })),
    false,
  )
  assert.equal(
    await isResponding('http://x', async () => {
      throw new Error('refused')
    }),
    false,
  )
})

test('allowsCorsOrigin sends a preflight and checks the allowed origin header', async () => {
  const requests: { url: string; init: RequestInit }[] = []
  const allowing = async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(url), init: init ?? {} })
    return new Response(null, {
      headers: { 'access-control-allow-origin': 'http://localhost:5173' },
    })
  }
  assert.equal(
    await allowsCorsOrigin({
      url: 'http://api/health',
      origin: 'http://localhost:5173',
      fetch: allowing,
    }),
    true,
  )
  assert.equal(requests[0].url, 'http://api/health')
  assert.equal(requests[0].init.method, 'OPTIONS')
  const headers = requests[0].init.headers as Record<string, string>
  assert.equal(headers.Origin, 'http://localhost:5173')
  assert.equal(headers['Access-Control-Request-Method'], 'POST')
  assert.equal(headers['Access-Control-Request-Headers'], 'authorization,content-type')

  const denying = async () => new Response(null)
  assert.equal(
    await allowsCorsOrigin({
      url: 'http://api/health',
      origin: 'http://localhost:5173',
      fetch: denying,
    }),
    false,
  )
  const failing = async () => {
    throw new Error('refused')
  }
  assert.equal(
    await allowsCorsOrigin({
      url: 'http://api/health',
      origin: 'http://localhost:5173',
      fetch: failing,
    }),
    false,
  )
})

test('ensureE2EAccount creates a missing account with the run password', async () => {
  const created: unknown[] = []
  const updated: unknown[] = []
  const user = await ensureE2EAccount({
    clerkApi: fakeClerkApi({
      createUser: async (input) => {
        created.push(input)
        return { id: 'user_new', emailAddresses: [input.email], firstName: input.firstName }
      },
      updateUserPassword: async (...input) => {
        updated.push(input)
      },
    }),
    email: 'e2e@example.com',
    password: 'secret',
  })
  assert.equal(user.id, 'user_new')
  assert.deepEqual(created, [{ email: 'e2e@example.com', password: 'secret', firstName: 'Teste' }])
  assert.deepEqual(updated, [])
})

test('ensureE2EAccount rotates the password of an existing account', async () => {
  const updated: unknown[] = []
  const user = await ensureE2EAccount({
    clerkApi: fakeClerkApi({
      findUserByEmail: async () => ({ id: 'user_old', emailAddresses: [], firstName: 'Teste' }),
      createUser: async () => {
        throw new Error('must not create')
      },
      updateUserPassword: async (...input) => {
        updated.push(input)
      },
    }),
    email: 'e2e@example.com',
    password: 'secret',
  })
  assert.equal(user.id, 'user_old')
  assert.deepEqual(updated, [['user_old', 'secret']])
})

test('removeSignUpTestUsers deletes only sign-up test accounts and returns the count', async () => {
  const deleted: string[] = []
  const count = await removeSignUpTestUsers(
    fakeClerkApi({
      listAllUsers: async () => [
        { id: 'user_a', emailAddresses: [signUpTestEmail(1)], firstName: null },
        { id: 'user_b', emailAddresses: ['ana@example.com'], firstName: null },
      ],
      deleteUser: async (userId) => {
        deleted.push(userId)
      },
    }),
  )
  assert.equal(count, 1)
  assert.deepEqual(deleted, ['user_a'])
})

test('buildLocalResetArguments runs the reset statements on the local database', () => {
  const commandArguments = buildLocalResetArguments('user_3KwX8')
  assert.deepEqual(commandArguments.slice(0, 7), [
    '--filter',
    '@clavis-via/api',
    'exec',
    'wrangler',
    'd1',
    'execute',
    'DB',
  ])
  assert.equal(commandArguments[7], '--local')
  assert.equal(commandArguments[8], '--command')
  assert.equal(commandArguments[9], buildResetStatements('user_3KwX8'))
})

test('runCommand returns the exit status, or 1 when there is none', () => {
  const calls: unknown[][] = []
  const withStatus = (...input: unknown[]) => {
    calls.push(input)
    return { status: 3 }
  }
  assert.equal(runCommand('pnpm', ['test'], '/root', withStatus as never), 3)
  assert.deepEqual(calls[0], ['pnpm', ['test'], { cwd: '/root', stdio: 'inherit' }])
  assert.equal(runCommand('pnpm', [], '/root', (() => ({ status: null })) as never), 1)
})

test('readEnvironmentValue reads one key from dotenv content', () => {
  const content = '# comment\nVITE_CLERK_PUBLISHABLE_KEY=pk_test_abc\nOTHER=1\n'
  assert.equal(readEnvironmentValue(content, 'VITE_CLERK_PUBLISHABLE_KEY'), 'pk_test_abc')
  assert.equal(readEnvironmentValue(content, 'MISSING'), '')
})

import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { ClerkApi, ClerkUser } from './@types/clerk.type.ts'
import { ensureDemoAccount } from './demo-account.ts'

const user: ClerkUser = { id: 'user_1', firstName: 'Ana', emailAddresses: ['ana@example.com'] }
const input = { email: 'ana@example.com', password: 'pw', firstName: 'Ana', image: new Blob(['x']) }

function fakeApi(existing: ClerkUser | null) {
  const calls: string[] = []
  const clerkApi: ClerkApi = {
    findUserByEmail: async () => existing,
    createUser: async () => {
      calls.push('createUser')
      return user
    },
    setProfileImage: async (userId) => {
      calls.push(`setProfileImage:${userId}`)
    },
    listUsers: async () => [],
    listAllUsers: async () => [],
    updateUserPassword: async () => {},
    deleteUser: async () => {},
  }
  return { calls, clerkApi }
}

test('creates the missing user and then sets the photo', async () => {
  const { calls, clerkApi } = fakeApi(null)
  assert.deepEqual(await ensureDemoAccount(clerkApi, input), user)
  assert.deepEqual(calls, ['createUser', 'setProfileImage:user_1'])
})

test('an existing user only gets the photo refreshed', async () => {
  const { calls, clerkApi } = fakeApi(user)
  await ensureDemoAccount(clerkApi, input)
  assert.deepEqual(calls, ['setProfileImage:user_1'])
})

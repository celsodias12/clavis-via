import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { parseEnv } from 'node:util'
import type { ClerkApi, ClerkUser } from './@types/clerk.type.ts'
import { E2E } from './constants/e2e.constant.ts'

// The SQL goes to `wrangler d1 execute --command`, which takes no parameters,
// so the id is validated against the Clerk user id shape instead.
export function buildResetStatements(userId: string): string {
  if (!E2E.USER_ID_PATTERN.test(userId)) {
    throw new Error('Invalid user id for the E2E reset')
  }
  return E2E.RESET_TABLES.map((table) => `DELETE FROM ${table} WHERE user_id = '${userId}';`).join(
    ' ',
  )
}

export function signUpTestEmail(timestamp: number): string {
  return `${E2E.SIGN_UP_EMAIL_PREFIX}${timestamp}${E2E.SIGN_UP_EMAIL_SUFFIX}`
}

export function isSignUpTestEmail(email: string): boolean {
  return E2E.SIGN_UP_EMAIL_PATTERN.test(email)
}

// Maestro logs every typed value, so each run uses a fresh password that is worthless afterwards.
export function generateOneTimePassword(): string {
  return `${randomBytes(E2E.PASSWORD_BYTES).toString('base64url')}${E2E.PASSWORD_COMPLEXITY_SUFFIX}`
}

export async function isResponding(
  url: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<boolean> {
  try {
    return (await fetchImplementation(url)).ok
  } catch {
    return false
  }
}

// A browser asks the API for permission before every cross-origin tRPC call; the web E2E only works when the
// API answers that preflight for the web dev server origin.
export async function allowsCorsOrigin({
  url,
  origin,
  fetch: fetchImplementation = fetch,
}: {
  url: string
  origin: string
  fetch?: typeof fetch
}): Promise<boolean> {
  try {
    const response = await fetchImplementation(url, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': E2E.CORS_PREFLIGHT_METHOD,
        'Access-Control-Request-Headers': E2E.CORS_PREFLIGHT_HEADERS,
      },
    })
    return response.headers.get(E2E.CORS_ALLOW_ORIGIN_HEADER) === origin
  } catch {
    return false
  }
}

// An existing account gets the one-time password too, so the previous run's value stops working.
export async function ensureE2EAccount({
  clerkApi,
  email,
  password,
}: {
  clerkApi: ClerkApi
  email: string
  password: string
}): Promise<ClerkUser> {
  const existingUser = await clerkApi.findUserByEmail(email)
  if (existingUser) {
    await clerkApi.updateUserPassword(existingUser.id, password)
    return existingUser
  }
  return clerkApi.createUser({ email, password, firstName: E2E.MAIN_USER_FIRST_NAME })
}

export async function removeSignUpTestUsers(clerkApi: ClerkApi): Promise<number> {
  const leftovers = (await clerkApi.listAllUsers({ query: E2E.SIGN_UP_EMAIL_PREFIX })).filter(
    (user) => user.emailAddresses.some(isSignUpTestEmail),
  )
  for (const user of leftovers) {
    await clerkApi.deleteUser(user.id)
  }
  return leftovers.length
}

// Arguments of the `pnpm` call that clears the user's progress in the LOCAL D1 database.
export function buildLocalResetArguments(userId: string): string[] {
  return [
    '--filter',
    E2E.API_PACKAGE_NAME,
    'exec',
    'wrangler',
    'd1',
    'execute',
    'DB',
    '--local',
    '--command',
    buildResetStatements(userId),
  ]
}

export function runCommand(
  command: string,
  commandArguments: string[],
  workingDirectory: string,
  spawn: typeof spawnSync = spawnSync,
): number {
  const result = spawn(command, commandArguments, { cwd: workingDirectory, stdio: 'inherit' })
  return result.status ?? 1
}

// Reads one value from dotenv content without loading the file into the environment.
export function readEnvironmentValue(content: string, key: string): string {
  return parseEnv(content)[key] ?? ''
}

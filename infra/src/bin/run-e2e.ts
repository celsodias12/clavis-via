import { createClerkApi } from '../clerk-api.ts'
import { E2E } from '../constants/e2e.constant.ts'
import {
  buildLocalResetArguments,
  ensureE2EAccount,
  generateOneTimePassword,
  isResponding,
  removeSignUpTestUsers,
  runCommand,
  signUpTestEmail,
} from '../e2e.ts'

const repositoryRoot = new URL('../../../', import.meta.url).pathname
const email = process.env.E2E_EMAIL ?? ''
// Maestro logs every typed value, so both passwords are random and used for this run only.
const password = generateOneTimePassword()
const signUpPassword = generateOneTimePassword()
const clerkApi = createClerkApi({ secretKey: process.env.CLERK_SECRET_KEY ?? '' })

function run(command: string, commandArguments: string[]): number {
  return runCommand(command, commandArguments, repositoryRoot)
}

if (!(await isResponding(E2E.API_HEALTH_URL))) {
  console.error('The local API is not responding. Start it with: pnpm --filter @clavis-via/api dev')
  process.exit(1)
}
if (!(await isResponding(E2E.METRO_STATUS_URL))) {
  console.error('Metro is not responding. Start it with: pnpm --filter @clavis-via/mobile start')
  process.exit(1)
}

// Lets the device reach Metro on localhost (used by the dev launcher deep link fallback).
run('adb', ['reverse', 'tcp:8081', 'tcp:8081'])

const mainUser = await ensureE2EAccount({ clerkApi, email, password })

let exitCode = run('pnpm', buildLocalResetArguments(mainUser.id))

try {
  if (exitCode === 0) {
    exitCode = run('mise', [
      'exec',
      '--',
      'maestro',
      'test',
      E2E.FLOWS_DIRECTORY,
      '-e',
      `E2E_EMAIL=${email}`,
      '-e',
      `E2E_PASSWORD=${password}`,
      '-e',
      `SIGN_UP_EMAIL=${signUpTestEmail(Date.now())}`,
      '-e',
      `SIGN_UP_PASSWORD=${signUpPassword}`,
    ])
  }
} finally {
  console.log(`Removed ${await removeSignUpTestUsers(clerkApi)} sign-up test user(s) from Clerk`)
}

process.exit(exitCode)

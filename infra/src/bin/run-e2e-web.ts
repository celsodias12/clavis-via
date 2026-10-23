import { existsSync, readFileSync } from 'node:fs'
import { createClerkApi } from '../clerk-api.ts'
import { E2E } from '../constants/e2e.constant.ts'
import {
  allowsCorsOrigin,
  buildLocalResetArguments,
  ensureE2EAccount,
  generateOneTimePassword,
  isResponding,
  readEnvironmentValue,
  removeSignUpTestUsers,
  runCommand,
  signUpTestEmail,
} from '../e2e.ts'

const repositoryRoot = new URL('../../../', import.meta.url).pathname
const email = process.env.E2E_EMAIL ?? ''
// Both passwords are random and used for this run only; they reach Playwright through the environment.
const password = generateOneTimePassword()
const clerkApi = createClerkApi({ secretKey: process.env.CLERK_SECRET_KEY ?? '' })

function run(command: string, commandArguments: string[]): number {
  return runCommand(command, commandArguments, repositoryRoot)
}

if (!(await isResponding(E2E.API_HEALTH_URL))) {
  console.error(
    `The local API is not responding. Start it with: pnpm --filter ${E2E.API_PACKAGE_NAME} dev`,
  )
  process.exit(1)
}
if (!(await allowsCorsOrigin({ url: E2E.API_HEALTH_URL, origin: E2E.WEB_ORIGIN }))) {
  console.error(
    `The local API does not allow ${E2E.WEB_ORIGIN} through CORS. Set CORS_ALLOWED_ORIGINS=${E2E.WEB_ORIGIN} in api/.env and restart the API.`,
  )
  process.exit(1)
}

const environmentFile = `${repositoryRoot}${E2E.WEB_ENVIRONMENT_FILE}`
if (!existsSync(environmentFile)) {
  console.error(
    `${E2E.WEB_ENVIRONMENT_FILE} does not exist. Copy web/.env.example to it and fill in the Clerk publishable key.`,
  )
  process.exit(1)
}

let exitCode = 1
let mainUserId = ''
try {
  // The account password is set inside the try, so the rotation in the finally always follows it.
  const mainUser = await ensureE2EAccount({ clerkApi, email, password })
  mainUserId = mainUser.id
  const publishableKey = readEnvironmentValue(
    readFileSync(environmentFile, 'utf8'),
    E2E.WEB_PUBLISHABLE_KEY_NAME,
  )

  // Clerk's Playwright helpers read the keys from these variables (the secret key is already set by --env-file).
  process.env.CLERK_PUBLISHABLE_KEY = publishableKey
  process.env.E2E_PASSWORD = password
  process.env.SIGN_UP_EMAIL = signUpTestEmail(Date.now())
  process.env.SIGN_UP_PASSWORD = generateOneTimePassword()

  exitCode = run('pnpm', buildLocalResetArguments(mainUser.id))
  if (exitCode === 0) {
    exitCode = run('pnpm', ['--filter', E2E.WEB_PACKAGE_NAME, 'e2e'])
  }
} finally {
  // The password only needed to live for the run, so it is replaced by another value nobody has seen.
  if (mainUserId) {
    await clerkApi.updateUserPassword(mainUserId, generateOneTimePassword())
  }
  console.log(`Removed ${await removeSignUpTestUsers(clerkApi)} sign-up test user(s) from Clerk`)
}

process.exit(exitCode)

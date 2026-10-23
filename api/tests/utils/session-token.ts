import { env } from 'cloudflare:workers'
import { importPKCS8, SignJWT } from 'jose'

const DEFAULT_EXPIRATION_SECONDS = 60

type SignSessionTokenOptions = {
  userId: string
  expiresInSeconds?: number
  notBeforeSecondsFromNow?: number
  privateKey?: string
}

// Signs a Clerk-like session token (RS256) with the test private key unless another one is given.
export async function signSessionToken(options: SignSessionTokenOptions): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const key = await importPKCS8(options.privateKey ?? env.TEST_CLERK_PRIVATE_KEY, 'RS256')
  return new SignJWT({ sid: 'sess_test', v: 2 })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: 'test' })
    .setSubject(options.userId)
    .setIssuedAt(now)
    .setNotBefore(now + (options.notBeforeSecondsFromNow ?? 0))
    .setExpirationTime(now + (options.expiresInSeconds ?? DEFAULT_EXPIRATION_SECONDS))
    .sign(key)
}

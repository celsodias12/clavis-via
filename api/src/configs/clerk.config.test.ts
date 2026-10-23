import { env } from 'cloudflare:workers'
import { exportPKCS8, generateKeyPair } from 'jose'
import { describe, expect, it } from 'vitest'
import { signSessionToken } from '../../tests/utils/session-token'
import { verifySessionToken } from './clerk.config'

const USER_ID = 'user_1'
const TEN_MINUTES_IN_SECONDS = 600
const TWO_MINUTES_IN_SECONDS = 120

describe('verifySessionToken', () => {
  it('returns the user id of a valid token', async () => {
    const token = await signSessionToken({ userId: USER_ID })
    expect(await verifySessionToken(token, env.CLERK_JWT_KEY)).toBe(USER_ID)
  })

  it('returns null for an expired token', async () => {
    const token = await signSessionToken({
      userId: USER_ID,
      expiresInSeconds: -TWO_MINUTES_IN_SECONDS,
    })
    expect(await verifySessionToken(token, env.CLERK_JWT_KEY)).toBeNull()
  })

  it('returns null for a token that is not valid yet', async () => {
    const token = await signSessionToken({
      userId: USER_ID,
      notBeforeSecondsFromNow: TEN_MINUTES_IN_SECONDS,
    })
    expect(await verifySessionToken(token, env.CLERK_JWT_KEY)).toBeNull()
  })

  it('returns null for a token signed with another key', async () => {
    const { privateKey } = await generateKeyPair('RS256', {
      modulusLength: 2048,
      extractable: true,
    })
    const token = await signSessionToken({
      userId: USER_ID,
      privateKey: await exportPKCS8(privateKey),
    })
    expect(await verifySessionToken(token, env.CLERK_JWT_KEY)).toBeNull()
  })

  it('returns null for text that is not a JWT', async () => {
    expect(await verifySessionToken('not-a-jwt', env.CLERK_JWT_KEY)).toBeNull()
  })
})

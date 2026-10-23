import { verifyToken } from '@clerk/backend'

// Verifies a Clerk session token locally with the instance public key (no network).
// `authorizedParties` is left out on purpose: tokens from the native app carry no `azp`.
export async function verifySessionToken(token: string, jwtKey: string): Promise<string | null> {
  try {
    const payload = await verifyToken(token, { jwtKey })
    return payload.sub
  } catch {
    return null
  }
}

import { AUTHORIZATION } from '../constants/http.constant'

// Returns the token of a "Bearer <token>" header, or null when there is none.
export function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader?.startsWith(AUTHORIZATION.BEARER_PREFIX)) {
    return null
  }
  const token = authorizationHeader.slice(AUTHORIZATION.BEARER_PREFIX.length).trim()
  return token.length > 0 ? token : null
}

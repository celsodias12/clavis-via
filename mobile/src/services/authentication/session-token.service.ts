import { getClerkInstance } from '@clerk/expo'

export async function getSessionToken(): Promise<string | null> {
  return (await getClerkInstance().session?.getToken()) ?? null
}

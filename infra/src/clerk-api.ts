import type { ClerkApi, ClerkApiOptions, ClerkUser, ListUsersInput } from './@types/clerk.type.ts'
import { CLERK_API } from './constants/clerk.constant.ts'

type RawClerkUser = {
  id: string
  first_name: string | null
  email_addresses: { email_address: string }[]
}

function toClerkUser(raw: RawClerkUser): ClerkUser {
  return {
    id: raw.id,
    firstName: raw.first_name,
    emailAddresses: raw.email_addresses.map((entry) => entry.email_address),
  }
}

export function createClerkApi({
  secretKey,
  fetch: fetchImplementation = fetch,
}: ClerkApiOptions): ClerkApi {
  // The secret key is only ever placed in the Authorization header, never in errors.
  async function request(path: string, init: RequestInit = {}): Promise<unknown> {
    const response = await fetchImplementation(`${CLERK_API.BASE_URL}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${secretKey}` },
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        errors?: { code?: string }[]
      } | null
      const code = body?.errors?.[0]?.code ?? CLERK_API.UNKNOWN_ERROR_CODE
      throw new Error(
        `Clerk API request failed: ${init.method ?? 'GET'} ${path} -> ${response.status} (${code})`,
      )
    }
    return response.json().catch(() => null)
  }

  async function listUsers({ query, limit, offset }: ListUsersInput): Promise<ClerkUser[]> {
    let path = `${CLERK_API.USERS_PATH}?query=${encodeURIComponent(query)}`
    if (limit !== undefined) path += `&limit=${limit}`
    if (offset !== undefined) path += `&offset=${offset}`
    const raw = (await request(path)) as RawClerkUser[]
    return raw.map(toClerkUser)
  }

  // Pages with offset until a page comes back shorter than the limit.
  async function listAllUsers({ query }: { query: string }): Promise<ClerkUser[]> {
    const users: ClerkUser[] = []
    let page: ClerkUser[]
    do {
      page = await listUsers({ query, limit: CLERK_API.MAX_PAGE_SIZE, offset: users.length })
      users.push(...page)
    } while (page.length === CLERK_API.MAX_PAGE_SIZE)
    return users
  }

  return {
    listUsers,
    listAllUsers,
    async findUserByEmail(email) {
      const raw = (await request(
        `${CLERK_API.USERS_PATH}?email_address=${encodeURIComponent(email)}`,
      )) as RawClerkUser[]
      return raw.length === 0 ? null : toClerkUser(raw[0])
    },
    async createUser({ email, password, firstName }) {
      const raw = (await request(CLERK_API.USERS_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_address: [email], password, first_name: firstName }),
      })) as RawClerkUser
      return toClerkUser(raw)
    },
    async setProfileImage(userId, image) {
      const form = new FormData()
      form.append(CLERK_API.IMAGE_FIELD_NAME, image, CLERK_API.IMAGE_FILE_NAME)
      await request(`${CLERK_API.USERS_PATH}/${userId}${CLERK_API.PROFILE_IMAGE_SUFFIX}`, {
        method: 'POST',
        body: form,
      })
    },
    async updateUserPassword(userId, password) {
      await request(`${CLERK_API.USERS_PATH}/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
    },
    async deleteUser(userId) {
      await request(`${CLERK_API.USERS_PATH}/${userId}`, { method: 'DELETE' })
    },
  }
}

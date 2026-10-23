export type ClerkUser = {
  id: string
  emailAddresses: string[]
  firstName: string | null
}

export type ClerkApiOptions = {
  secretKey: string
  fetch?: typeof fetch
}

export type CreateUserInput = {
  email: string
  password: string
  firstName: string
}

export type ListUsersInput = {
  query: string
  limit?: number
  offset?: number
}

export type ClerkApi = {
  findUserByEmail: (email: string) => Promise<ClerkUser | null>
  createUser: (input: CreateUserInput) => Promise<ClerkUser>
  setProfileImage: (userId: string, image: Blob) => Promise<void>
  listUsers: (input: ListUsersInput) => Promise<ClerkUser[]>
  listAllUsers: (input: { query: string }) => Promise<ClerkUser[]>
  updateUserPassword: (userId: string, password: string) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
}

export type DemoAccountInput = CreateUserInput & { image: Blob }

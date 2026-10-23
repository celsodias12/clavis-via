import type { ClerkApi, ClerkUser, DemoAccountInput } from './@types/clerk.type.ts'

// Idempotent: creates the user only when missing, and always refreshes the photo.
export async function ensureDemoAccount(
  clerkApi: ClerkApi,
  { email, password, firstName, image }: DemoAccountInput,
): Promise<ClerkUser> {
  const user =
    (await clerkApi.findUserByEmail(email)) ??
    (await clerkApi.createUser({ email, password, firstName }))
  await clerkApi.setProfileImage(user.id, image)
  return user
}

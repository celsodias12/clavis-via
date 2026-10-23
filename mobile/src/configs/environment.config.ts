import { z } from 'zod'

// Validate and type the public environment variables in a single place.
const environmentSchema = z.strictObject({
  EXPO_PUBLIC_API_BASE_URL: z.url(),
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
})

export function parseEnvironment(values: Record<string, string | undefined>) {
  const parsed = environmentSchema.parse(values)
  return {
    apiBaseUrl: parsed.EXPO_PUBLIC_API_BASE_URL,
    clerkPublishableKey: parsed.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  }
}

// Expo inlines EXPO_PUBLIC_* only for literal `process.env.NAME` access, so each variable is read by name.
export const environment = parseEnvironment({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
})

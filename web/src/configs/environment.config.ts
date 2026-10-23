import { z } from 'zod'

// Validate and type the public environment variables in a single place.
const environmentSchema = z.strictObject({
  VITE_API_BASE_URL: z.url(),
  VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1),
})

export function parseEnvironment(values: Record<string, string | undefined>) {
  const parsed = environmentSchema.parse(values)
  return {
    apiBaseUrl: parsed.VITE_API_BASE_URL,
    clerkPublishableKey: parsed.VITE_CLERK_PUBLISHABLE_KEY,
  }
}

// `import.meta.env` also carries Vite's own fields (MODE, BASE_URL...), so only the app's variables are
// picked before the strict validation.
export const environment = parseEnvironment({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
})

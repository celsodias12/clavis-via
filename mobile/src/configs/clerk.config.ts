import { tokenCache } from '@clerk/expo/token-cache'
import { environment } from './environment.config'

// Clerk provider props: the publishable key and the secure-store backed session cache.
export const clerkConfig = Object.freeze({
  publishableKey: environment.clerkPublishableKey,
  tokenCache,
})

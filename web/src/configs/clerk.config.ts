import { environment } from './environment.config'

// Clerk provider props: the publishable key of the instance.
export const clerkConfig = Object.freeze({
  publishableKey: environment.clerkPublishableKey,
})

import { clerkSetup } from '@clerk/testing/playwright'

// Runs once in the main process, so the Clerk testing token reaches every worker through the environment.
export default async function globalSetup(): Promise<void> {
  await clerkSetup()
}

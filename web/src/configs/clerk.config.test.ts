import { describe, expect, it } from 'vite-plus/test'
import { clerkConfig } from './clerk.config'
import { environment } from './environment.config'

describe('clerkConfig', () => {
  it('uses the publishable key of the validated environment', () => {
    expect(clerkConfig.publishableKey).toBe(environment.clerkPublishableKey)
  })
})

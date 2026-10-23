declare global {
  namespace Cloudflare {
    interface Env {
      TEST_CLERK_PRIVATE_KEY: string
      TEST_MIGRATIONS: import('cloudflare:test').D1Migration[]
    }
  }
}

export {}

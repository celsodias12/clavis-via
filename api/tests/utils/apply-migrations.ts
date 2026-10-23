import { applyD1Migrations } from 'cloudflare:test'
import { env } from 'cloudflare:workers'

// Applies the project migrations (including the content seed) to the isolated test database.
export async function applyMigrations() {
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
}

await applyMigrations()

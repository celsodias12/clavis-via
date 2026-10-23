import path from 'node:path'
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin'
import { exportPKCS8, exportSPKI, generateKeyPair } from 'jose'
import { defineConfig } from 'vitest/config'

// Fresh RSA key pair per run: the public key is the Clerk JWT key, the private one signs test tokens.
const { publicKey, privateKey } = await generateKeyPair('RS256', {
  modulusLength: 2048,
  extractable: true,
})

const migrations = await readD1Migrations(path.join(import.meta.dirname, 'migrations'))

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: {
        // Explicit test bindings so the suite never depends on the local .env file.
        bindings: {
          CORS_ALLOWED_ORIGINS: 'https://allowed.test',
          MOCK_REPLY_DELAY_MILLISECONDS: '0',
          CLERK_JWT_KEY: await exportSPKI(publicKey),
          TEST_CLERK_PRIVATE_KEY: await exportPKCS8(privateKey),
          TEST_MIGRATIONS: migrations,
        },
      },
    }),
  ],
  test: {
    setupFiles: ['./tests/utils/apply-migrations.ts'],
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'istanbul' as const,
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/@types/**'],
      reporter: ['text', 'json-summary', 'lcov'],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
})

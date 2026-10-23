import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, lazyPlugins } from 'vite-plus'

export default defineConfig({
  plugins: lazyPlugins(() => [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ]),
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/utils/setup.ts'],
    // Public variables the app validates at load; they take precedence over web/.env.local.
    env: {
      VITE_API_BASE_URL: 'http://api.test',
      VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_vitest',
    },
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    // Playwright specs run with `pnpm e2e:web`, never in Vitest.
    exclude: ['**/node_modules/**', 'tests/e2e/**'],
    coverage: {
      provider: 'istanbul',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.*',
        'src/main.tsx',
        'src/components/ui/**',
        'src/lib/utils.ts',
        'src/routeTree.gen.ts',
        // Declarative wiring (path + screen); the router plugin adds code to these files that tests never run.
        // tests/integrations/routes.test.tsx opens every route.
        'src/routes/**',
      ],
      reporter: ['text', 'json-summary', 'lcov'],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
})

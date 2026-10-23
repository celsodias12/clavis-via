import { defineConfig } from 'vite-plus'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/utils/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'istanbul',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/@types/**', 'src/i18n/locales/**'],
      reporter: ['text', 'json-summary', 'lcov'],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
})

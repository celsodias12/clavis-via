import { defineConfig, devices } from '@playwright/test'
import {
  E2E_LOCALE,
  E2E_PROJECTS,
  E2E_SERVER,
  E2E_TIMEOUT,
  E2E_VIEWPORTS,
} from './tests/utils/e2e.constant.ts'

// The suite shares one account and its database rows, so tests run one after the other. The API must already
// be running (pnpm e2e:web checks it); the web dev server is started here. The projects chain the files in the
// order they need (each one waits for the previous), so the order does not depend on the file names.
export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global.setup.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  timeout: E2E_TIMEOUT * 3,
  expect: { timeout: E2E_TIMEOUT },
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: E2E_SERVER.URL,
    locale: E2E_LOCALE,
    viewport: E2E_VIEWPORTS.DESKTOP,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: E2E_PROJECTS.MAIN_FLOW, testMatch: 'main-flow.spec.ts' },
    {
      name: E2E_PROJECTS.DEEP_LINKS,
      testMatch: 'deep-links.spec.ts',
      dependencies: [E2E_PROJECTS.MAIN_FLOW],
    },
    {
      name: E2E_PROJECTS.SIGN_UP,
      testMatch: 'sign-up.spec.ts',
      dependencies: [E2E_PROJECTS.DEEP_LINKS],
    },
  ],
  webServer: {
    command: E2E_SERVER.COMMAND,
    url: E2E_SERVER.URL,
    reuseExistingServer: true,
    timeout: E2E_SERVER.STARTUP_TIMEOUT,
  },
})

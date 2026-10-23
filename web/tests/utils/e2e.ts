import { TEST_IDS } from '@clavis-via/shared/test-ids'
import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { expect, type Page } from '@playwright/test'
import { E2E_CONTENT, E2E_ENVIRONMENT, E2E_PATHS, E2E_TIMEOUT } from './e2e.constant'

export function requireEnvironment(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable ${name}; run the suite with pnpm e2e:web`)
  }
  return value
}

// Lets the page past Clerk's bot protection (needs the testing token created by the global setup).
export async function openApp(page: Page, path: string = E2E_PATHS.WELCOME): Promise<void> {
  await setupClerkTestingToken({ page })
  await page.goto(path)
}

// Signs the dedicated E2E account in through the sign-in form.
export async function signIn(page: Page): Promise<void> {
  await openApp(page)
  await page.getByTestId(TEST_IDS.WELCOME_SIGN_IN).click()
  await page.getByTestId(TEST_IDS.SIGN_IN_EMAIL).fill(requireEnvironment(E2E_ENVIRONMENT.EMAIL))
  await page
    .getByTestId(TEST_IDS.SIGN_IN_PASSWORD)
    .fill(requireEnvironment(E2E_ENVIRONMENT.PASSWORD))
  await page.getByTestId(TEST_IDS.AUTHENTICATION_SUBMIT).click()
  await page.waitForURL((url) => url.pathname !== E2E_PATHS.SIGN_IN, { timeout: E2E_TIMEOUT })
}

// Picks "Ansiosa" on the Check-in and saves it, which opens Início.
export async function submitAnxiousCheckIn(page: Page): Promise<void> {
  const option = page.getByTestId(`${TEST_IDS.CHECK_IN_OPTION_PREFIX}${E2E_CONTENT.CHECK_IN_STATE}`)
  await expect(option).toBeVisible({ timeout: E2E_TIMEOUT })
  await option.click()
  await page.getByTestId(TEST_IDS.CHECK_IN_SUBMIT).click()
}

export async function expectDailyKey(page: Page): Promise<void> {
  await expect(page.getByText(E2E_CONTENT.DAILY_KEY_TITLE).first()).toBeVisible({
    timeout: E2E_TIMEOUT,
  })
}

// The tab items live in the side navigation (wide screens) or the bottom tabs (narrow ones), never in both.
export async function openTab(page: Page, tab: string): Promise<void> {
  await page.getByTestId(`${TEST_IDS.TAB_BAR_ITEM_PREFIX}${tab}`).click()
}

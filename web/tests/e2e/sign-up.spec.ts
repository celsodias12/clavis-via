import { TEST_IDS } from '@clavis-via/shared/test-ids'
import { expect, test } from '@playwright/test'
import { openApp, requireEnvironment } from '../utils/e2e'
import { E2E_CONTENT, E2E_ENVIRONMENT, E2E_TIMEOUT } from '../utils/e2e.constant'

test('a new user signs up and lands on the Check-in', async ({ page }) => {
  await openApp(page)
  await page.getByTestId(TEST_IDS.WELCOME_START).click()
  await page.getByTestId(TEST_IDS.SIGN_UP_FIRST_NAME).fill(E2E_CONTENT.FIRST_NAME)
  await page
    .getByTestId(TEST_IDS.SIGN_UP_EMAIL)
    .fill(requireEnvironment(E2E_ENVIRONMENT.SIGN_UP_EMAIL))
  const password = page.getByTestId(TEST_IDS.SIGN_UP_PASSWORD)
  await password.fill(requireEnvironment(E2E_ENVIRONMENT.SIGN_UP_PASSWORD))
  // Enter in the last field sends the form, since the screen is a native <form>.
  await password.press('Enter')

  await expect(page.getByTestId(TEST_IDS.CHECK_IN_SUBMIT)).toBeVisible({ timeout: E2E_TIMEOUT })
})

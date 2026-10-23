import { TEST_IDS } from '@clavis-via/shared/test-ids'
import { expect, test } from '@playwright/test'
import { expectDailyKey, openApp, signIn } from '../utils/e2e'
import { E2E_PATHS, E2E_TIMEOUT } from '../utils/e2e.constant'

test('a signed in user opens a day directly and again after a reload', async ({ page }) => {
  await signIn(page)

  await page.goto(E2E_PATHS.PLAN_DAY)
  await expect(page.getByTestId(TEST_IDS.DAY_SCREEN)).toBeVisible({ timeout: E2E_TIMEOUT })

  await page.reload()
  await expect(page.getByTestId(TEST_IDS.DAY_SCREEN)).toBeVisible({ timeout: E2E_TIMEOUT })
})

test('a signed out visitor of a private route is sent to the entry screen', async ({ page }) => {
  await openApp(page, E2E_PATHS.EMOTIONS)

  await expect(page).toHaveURL(E2E_PATHS.WELCOME)
  await expect(page.getByTestId(TEST_IDS.WELCOME_START)).toBeVisible({ timeout: E2E_TIMEOUT })
})

test('an unauthorized response ends the rejected session and allows signing in again', async ({
  page,
}) => {
  await signIn(page)
  await expectDailyKey(page)
  const apiRequests = (url: URL) => url.pathname.startsWith('/trpc/')
  await page.route(apiRequests, (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          message: 'UNAUTHORIZED',
          code: -32001,
          data: { code: 'UNAUTHORIZED', httpStatus: 401 },
        },
      }),
    }),
  )

  await page.reload()

  await expect(page).toHaveURL(E2E_PATHS.WELCOME)
  await expect(page.getByTestId(TEST_IDS.WELCOME_START)).toBeVisible({ timeout: E2E_TIMEOUT })
  await page.unroute(apiRequests)
  await signIn(page)
  await expectDailyKey(page)
})

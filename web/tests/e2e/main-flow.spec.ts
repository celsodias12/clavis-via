import { TEST_IDS } from '@clavis-via/shared/test-ids'
import { expect, type Page, test } from '@playwright/test'
import { expectDailyKey, openTab, signIn, submitAnxiousCheckIn } from '../utils/e2e'
import { E2E_CONTENT, E2E_PATHS, E2E_TIMEOUT, E2E_VIEWPORTS } from '../utils/e2e.constant'

const FIRST_DAY_ROW = `${TEST_IDS.PLAN_DAY_ROW_PREFIX}${E2E_CONTENT.FIRST_DAY_NUMBER}`

// This file is the first project of the suite (see playwright.config.ts): the desktop test runs on the freshly
// reset account, so its Check-in is the first of the day.
test.describe('desktop', () => {
  test.use({ viewport: E2E_VIEWPORTS.DESKTOP })

  test('the six steps of the main flow', async ({ page }) => {
    await test.step('1. sign in', async () => {
      await signIn(page)
    })

    await test.step('2. Check-in "Ansiosa"', async () => {
      await submitAnxiousCheckIn(page)
    })

    await test.step('3. Início shows the daily key', async () => {
      await expectDailyKey(page)

      // The Check-in replaced itself with Início, so Back never reopens the form (a second one for the day).
      await page.goBack()
      await expect(page).not.toHaveURL(E2E_PATHS.CHECK_IN_PATTERN)
      await expect(page.getByTestId(TEST_IDS.CHECK_IN_SUBMIT)).toHaveCount(0)
      await expectDailyKey(page)
    })

    await test.step('4. open the plan and complete Day 1', async () => {
      await openTab(page, E2E_CONTENT.TAB_PLANS)
      await page.getByTestId(`${TEST_IDS.PLANS_ITEM_PREFIX}${E2E_CONTENT.PLAN_ID}`).click()
      await page.getByTestId(TEST_IDS.PLAN_PRIMARY_BUTTON).click()
      await page
        .getByTestId(`${TEST_IDS.DAY_SEGMENT_PREFIX}${E2E_CONTENT.DAY_SEGMENT_ACTION}`)
        .click()
      await page.getByTestId(TEST_IDS.DAY_ACTION_BUTTON).click()
      await page.getByTestId(TEST_IDS.DAY_ACTION_REFLECTION).fill(E2E_CONTENT.REFLECTION)
      await page.getByTestId(TEST_IDS.DAY_ACTION_COMPLETE_BUTTON).click()

      await expect(
        page.getByTestId(`${FIRST_DAY_ROW}${TEST_IDS.PLAN_DAY_ROW_COMPLETED_SUFFIX}`),
      ).toBeVisible({ timeout: E2E_TIMEOUT })

      // Completing replaced the action page, so Back lands on the day and never on the form again.
      await page.goBack()
      await expect(page.getByTestId(TEST_IDS.DAY_SCREEN)).toBeVisible()
      await expect(page.getByTestId(TEST_IDS.DAY_ACTION_SCREEN)).toHaveCount(0)

      // Back on the day goes to the plan.
      await page.goBack()
      await expect(page.getByTestId(TEST_IDS.PLAN_SCREEN)).toBeVisible()
      await expect(page.getByTestId(TEST_IDS.DAY_SCREEN)).toHaveCount(0)
    })

    await test.step('5. Jornada and Emoções show the check-in and the completion', async () => {
      await openTab(page, E2E_CONTENT.TAB_JOURNEY)
      await expect(
        page.getByTestId(
          `${TEST_IDS.JOURNEY_ACHIEVEMENT_PREFIX}${E2E_CONTENT.WEEKLY_CHECK_INS_ACHIEVEMENT}`,
        ),
      ).toBeVisible({ timeout: E2E_TIMEOUT })
      await expect(
        page.getByTestId(
          `${TEST_IDS.JOURNEY_ACHIEVEMENT_PREFIX}${E2E_CONTENT.PLAN_PROGRESS_ACHIEVEMENT}`,
        ),
      ).toBeVisible()

      await page
        .getByTestId(`${TEST_IDS.JOURNEY_SEGMENT_PREFIX}${E2E_CONTENT.JOURNEY_SEGMENT_EMOTIONS}`)
        .click()
      await expect(emotionDayWithCheckIn(page)).toBeVisible({ timeout: E2E_TIMEOUT })
    })

    await test.step('6. reload keeps the data', async () => {
      await page.reload()
      await expect(emotionDayWithCheckIn(page)).toBeVisible({ timeout: E2E_TIMEOUT })

      await openTab(page, E2E_CONTENT.TAB_JOURNEY)
      await expect(
        page.getByTestId(
          `${TEST_IDS.JOURNEY_ACHIEVEMENT_PREFIX}${E2E_CONTENT.PLAN_PROGRESS_ACHIEVEMENT}`,
        ),
      ).toBeVisible({ timeout: E2E_TIMEOUT })
    })
  })
})

// Steps 1 to 3 on a phone. Today already has a check-in from the desktop run, and a new one replaces it.
test.describe('mobile', () => {
  test.use({ viewport: E2E_VIEWPORTS.MOBILE })

  test('sign in, Check-in and the daily key', async ({ page }) => {
    await signIn(page)

    await page.goto(E2E_PATHS.CHECK_IN)
    await submitAnxiousCheckIn(page)
    await expectDailyKey(page)
  })
})

function emotionDayWithCheckIn(page: Page) {
  return page
    .getByTestId(new RegExp(`^${TEST_IDS.EMOTIONS_DAY_PREFIX}`))
    .and(page.getByRole('img', { name: E2E_CONTENT.CHECK_IN_LABEL }))
}

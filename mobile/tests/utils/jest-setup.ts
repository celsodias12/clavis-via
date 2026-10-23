// Global hooks for every test file: forces pt-BR and runs the shared MSW server.
import { SUPPORTED_LANGUAGES } from '@clavis-via/shared'
import { server } from '@clavis-via/shared/testing'
import * as Localization from 'expo-localization'
import { i18n } from '../../src/i18n/config'

// The real Clerk SDK opens a MessagePort when it loads (it keeps Jest from exiting), and no test talks to
// Clerk's servers; every test file gets the shared double. A file may still register its own jest.mock.
jest.mock('@clerk/expo', () => require('./clerk-mock').clerkModule)
jest.mock('@clerk/expo/token-cache', () => require('./clerk-mock').tokenCacheModule)

const deviceLocale = Localization.getLocales()[0]

beforeEach(() => {
  // Keep the detected device locale consistent with the Portuguese copy asserted by screen tests.
  jest
    .spyOn(Localization, 'getLocales')
    .mockReturnValue([
      { ...deviceLocale, languageTag: SUPPORTED_LANGUAGES.PORTUGUESE, languageCode: 'pt' },
    ])
})

beforeAll(async () => {
  server.listen({ onUnhandledFrame: 'error' })
  // jest-expo reports an English device locale; tests assert the default pt-BR copy.
  await i18n.changeLanguage(SUPPORTED_LANGUAGES.PORTUGUESE)
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

// React Query schedules a five-minute garbage-collection timer per inactive query; unref it so open
// timers never keep the Jest process alive after the tests have finished.
const originalSetTimeout = globalThis.setTimeout
globalThis.setTimeout = ((...parameters: Parameters<typeof setTimeout>) => {
  const timer = originalSetTimeout(...parameters)
  // The Node timer object has unref; the DOM-flavoured setTimeout type only knows the numeric handle.
  ;(timer as unknown as { unref?: () => void }).unref?.()
  return timer
}) as typeof setTimeout

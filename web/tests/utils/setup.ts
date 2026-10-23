// Global hooks for every test file: Clerk double, pt-BR copy, the shared MSW server and RTL cleanup.
import { SUPPORTED_LANGUAGES } from '@clavis-via/shared'
import { server } from '@clavis-via/shared/testing'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vite-plus/test'
import { i18n } from '../../src/configs/i18n.config'
import { clerkMock } from './clerk-mock'

// The real Clerk SDK loads clerk-js from the network; no test talks to Clerk's servers.
vi.mock('@clerk/react', async () => (await import('./clerk-mock')).clerkModule)

const DESKTOP_WIDTH = 1024

// jsdom has no matchMedia, which Sonner's Toaster reads for the color scheme.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
})

// jsdom does not implement media playback; the tests that care about the sound spy on these two methods.
HTMLMediaElement.prototype.play = () => Promise.resolve()
HTMLMediaElement.prototype.pause = () => {}

// jsdom does not implement scrolling, which the router calls on navigation.
window.scrollTo = vi.fn()

beforeAll(async () => {
  server.listen({ onUnhandledFrame: 'error' })
  // jsdom reports an English browser; tests assert the default pt-BR copy.
  await i18n.changeLanguage(SUPPORTED_LANGUAGES.PORTUGUESE)
})

afterEach(() => {
  cleanup()
  // Desktop-sized window by default; tests that need a phone set their own width.
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: DESKTOP_WIDTH })
  clerkMock.reset()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

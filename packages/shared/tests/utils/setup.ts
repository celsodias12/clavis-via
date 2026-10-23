// Global hooks for every test file: runs the shared MSW server.
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vite-plus/test'
import { server } from './server'

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

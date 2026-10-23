import { setupServer } from 'msw/node'

// Shared MSW server; the lifecycle is registered in setup.ts.
export const server = setupServer()

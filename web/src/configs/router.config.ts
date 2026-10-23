import { createRouter, type RouterHistory } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'

// Builds the app router; tests pass a memory history to start at a given path.
export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree, history })
}

export const router = createAppRouter()

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

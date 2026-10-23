// Shared Clerk test double. A test file registers it with
//   jest.mock('@clerk/expo', () => require('../utils/clerk-mock').clerkModule)
//   jest.mock('@clerk/expo/token-cache', () => require('../utils/clerk-mock').tokenCacheModule)
// and drives the session through `clerkMock`.
import { useSyncExternalStore } from 'react'

type ClerkSessionState = {
  isLoaded: boolean
  isSignedIn: boolean
  userId?: string | null
  sessionId?: string | null
}

const listeners = new Set<() => void>()

export const clerkMock = {
  state: { isLoaded: true, isSignedIn: false } as ClerkSessionState,
  // Replaces the session state and re-renders every component that reads it through useAuth (wrap in act()).
  setState(state: ClerkSessionState) {
    clerkMock.state = state
    for (const listener of listeners) {
      listener()
    }
  },
  signOut: jest.fn(async () => {}),
  endSession: jest.fn(async (_sessionId: string) => {}),
  getToken: jest.fn(async (): Promise<string | null> => null),
  reset() {
    clerkMock.state = { isLoaded: true, isSignedIn: false }
    clerkMock.signOut.mockReset().mockResolvedValue(undefined)
    clerkMock.endSession.mockReset().mockResolvedValue(undefined)
    clerkMock.getToken.mockClear()
    clerkMock.getToken.mockResolvedValue(null)
  },
}

function useSessionState() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => clerkMock.state,
  )
}

export const clerkModule = {
  ClerkProvider: ({ children }: { children: unknown }) => children,
  useSession: jest.fn(() => {
    const state = useSessionState()
    const id = state.isSignedIn ? (state.sessionId ?? state.userId ?? 'session') : null
    return {
      ...state,
      session: id
        ? { id, getToken: clerkMock.getToken, end: () => clerkMock.endSession(id) }
        : null,
    }
  }),
  useAuth: jest.fn(() => {
    const state = useSessionState()
    return { ...state, signOut: clerkMock.signOut, getToken: clerkMock.getToken }
  }),
  useClerk: jest.fn(() => ({ signOut: clerkMock.signOut })),
  useUser: jest.fn(() => ({ isLoaded: clerkMock.state.isLoaded, user: null })),
  useSignIn: jest.fn(() => ({ signIn: null, errors: null, fetchStatus: 'idle' })),
  useSignUp: jest.fn(() => ({ signUp: null, errors: null, fetchStatus: 'idle' })),
  getClerkInstance: jest.fn(() => ({
    signOut: clerkMock.signOut,
    session: { getToken: clerkMock.getToken },
  })),
}

export const tokenCacheModule = { tokenCache: undefined }

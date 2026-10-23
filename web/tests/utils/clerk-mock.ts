// Shared Clerk test double, registered for every test file in setup.ts. A test drives the session through
// `clerkMock`.
import { useSyncExternalStore } from 'react'
import { vi } from 'vite-plus/test'

type ClerkUserState = { firstName: string | null; hasImage: boolean; imageUrl: string }
type ClerkSessionState = {
  isLoaded: boolean
  isSignedIn: boolean
  userId?: string | null
  sessionId?: string | null
}

type ClerkProviderProps = {
  children: unknown
  routerPush?: (to: string) => unknown
  routerReplace?: (to: string) => unknown
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
  // The signed in user read by useUser; null while there is none.
  user: null as ClerkUserState | null,
  // The status Clerk reports ('loading', 'ready', 'degraded' or 'error').
  status: 'ready',
  // The props the last ClerkProvider received, to check what the app wires in.
  providerProps: null as ClerkProviderProps | null,
  signOut: vi.fn(async () => {}),
  endSession: vi.fn(async (_sessionId: string) => {}),
  getToken: vi.fn(async (): Promise<string | null> => null),
  reset() {
    clerkMock.state = { isLoaded: true, isSignedIn: false }
    clerkMock.user = null
    clerkMock.status = 'ready'
    clerkMock.providerProps = null
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
  ClerkProvider: (props: ClerkProviderProps) => {
    clerkMock.providerProps = props
    return props.children
  },
  useSession: vi.fn(() => {
    const state = useSessionState()
    const id = state.isSignedIn ? (state.sessionId ?? state.userId ?? 'session') : null
    return {
      ...state,
      session: id
        ? { id, getToken: clerkMock.getToken, end: () => clerkMock.endSession(id) }
        : null,
    }
  }),
  useAuth: vi.fn(() => {
    const state = useSessionState()
    return { ...state, signOut: clerkMock.signOut, getToken: clerkMock.getToken }
  }),
  useUser: vi.fn(() => ({ user: clerkMock.user })),
  useClerk: vi.fn(() => ({ signOut: clerkMock.signOut, status: clerkMock.status })),
  // A screen test returns its own sign-in / sign-up resource through vi.mocked(...).mockReturnValue.
  useSignIn: vi.fn(() => ({ signIn: null, errors: null, fetchStatus: 'idle' })),
  useSignUp: vi.fn(() => ({ signUp: null, errors: null, fetchStatus: 'idle' })),
}

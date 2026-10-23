import { render } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { clerkMock } from '../../../tests/utils/clerk-mock'
import { RootNavigator } from './root-navigator.component'

jest.mock('@clerk/expo', () => require('../../../tests/utils/clerk-mock').clerkModule)
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => true),
  hideAsync: jest.fn(async () => true),
}))
jest.mock('expo-router', () => {
  const Stack = Object.assign(
    jest.fn(({ children }) => children),
    { Protected: jest.fn(({ children }) => children), Screen: jest.fn(() => null) },
  )
  return { Stack }
})

const protectedGuards = () =>
  jest
    .mocked(Stack.Protected)
    .mock.calls.map(([properties]) => [properties.guard, properties.redirectTo])

beforeEach(() => {
  clerkMock.reset()
  jest.mocked(SplashScreen.hideAsync).mockClear()
  jest.mocked(Stack).mockClear()
  jest.mocked(Stack.Protected).mockClear()
})

describe('RootNavigator', () => {
  it('renders nothing and keeps the splash while Clerk loads', async () => {
    clerkMock.state = { isLoaded: false, isSignedIn: false }

    const screen = await render(<RootNavigator />)

    expect(screen.toJSON()).toBeNull()
    expect(Stack).not.toHaveBeenCalled()
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled()
  })

  it('hides the splash once Clerk has loaded', async () => {
    await render(<RootNavigator />)

    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1)
  })

  it('guards the public group for signed-out users and the private group for signed-in users', async () => {
    await render(<RootNavigator />)
    expect(protectedGuards()).toEqual([
      [true, '/start'],
      [false, '/'],
    ])

    jest.mocked(Stack.Protected).mockClear()
    clerkMock.state = { isLoaded: true, isSignedIn: true }
    await render(<RootNavigator />)
    expect(protectedGuards()).toEqual([
      [false, '/start'],
      [true, '/'],
    ])
  })

  it('ignores a failure to hide the splash', async () => {
    jest.mocked(SplashScreen.hideAsync).mockRejectedValueOnce(new Error('no splash'))

    await expect(render(<RootNavigator />)).resolves.toBeDefined()
  })

  it('ignores a failure to keep the splash visible', async () => {
    jest.mocked(SplashScreen.preventAutoHideAsync).mockRejectedValueOnce(new Error('no splash'))

    await jest.isolateModulesAsync(async () => {
      require('./root-navigator.component')
    })

    expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalled()
  })
})

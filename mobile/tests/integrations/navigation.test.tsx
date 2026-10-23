import { useTodayCheckIn } from '@clavis-via/shared'
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library'
import { Text } from 'react-native'
import RootLayout from '../../src/app/_layout'
import PrivateLayout from '../../src/app/(private)/_layout'
import TabsLayout from '../../src/app/(private)/(tabs)/_layout'
import PublicLayout from '../../src/app/(public)/_layout'
import { StartScreen } from '../../src/screens/start/start.screen'
import { clerkMock } from '../utils/clerk-mock'

jest.mock('@clerk/expo', () => require('../utils/clerk-mock').clerkModule)
jest.mock('@clerk/expo/token-cache', () => require('../utils/clerk-mock').tokenCacheModule)
jest.mock('@clavis-via/shared', () => ({
  ...jest.requireActual('@clavis-via/shared'),
  useTodayCheckIn: jest.fn(),
}))
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => true),
  hideAsync: jest.fn(async () => true),
}))

function stubScreen(label: string) {
  return () => <Text>{label}</Text>
}

const routes = {
  _layout: RootLayout,
  '(public)/_layout': PublicLayout,
  '(public)/index': stubScreen('welcome'),
  '(public)/sign-in': stubScreen('sign-in'),
  '(public)/sign-up': stubScreen('sign-up'),
  '(private)/_layout': PrivateLayout,
  '(private)/start': stubScreen('start'),
  '(private)/check-in': stubScreen('check-in'),
  '(private)/(tabs)/_layout': TabsLayout,
  '(private)/(tabs)/home': stubScreen('home'),
  '(private)/(tabs)/plans': stubScreen('plans'),
  '(private)/(tabs)/conversation': stubScreen('conversation'),
  '(private)/(tabs)/journey': stubScreen('journey'),
}

const TODAY_CHECK_IN = {
  id: 'check-in-1',
  state: 'anxious',
  otherText: null,
  localDate: '2026-10-19',
  createdAt: '2026-10-19T12:00:00.000Z',
  dailyKey: {
    title: 'Voz e Limites',
    text: 'Texto da chave.',
    practice: {
      id: 'guided-breathing',
      title: 'Respiração',
      durationSeconds: 180,
      description: 'x',
    },
  },
}

beforeEach(() => clerkMock.reset())

describe('route guards', () => {
  it('sends a signed-out user away from a private route', async () => {
    const view = await renderRouter(routes, { initialUrl: '/start' })

    expect(view.getPathname()).toBe('/')
    expect(screen.getByText('welcome')).toBeTruthy()
  })

  it('sends a signed-in user from the welcome route to the start route', async () => {
    clerkMock.state = { isLoaded: true, isSignedIn: true }

    const view = await renderRouter(routes, { initialUrl: '/' })

    expect(view.getPathname()).toBe('/start')
    expect(screen.getByText('start')).toBeTruthy()
  })

  it('renders no route while Clerk is loading', async () => {
    clerkMock.state = { isLoaded: false, isSignedIn: false }

    await renderRouter(routes, { initialUrl: '/' })

    expect(screen.queryByText('welcome')).toBeNull()
    expect(screen.queryByText('start')).toBeNull()
  })

  it('moves to the start route when the user signs in on a public route', async () => {
    const view = await renderRouter(routes, { initialUrl: '/sign-in' })
    expect(view.getPathname()).toBe('/sign-in')

    await act(async () => {
      clerkMock.setState({ isLoaded: true, isSignedIn: true })
    })

    expect(view.getPathname()).toBe('/start')
  })

  it('returns to the welcome route when the session ends on a private route', async () => {
    clerkMock.state = { isLoaded: true, isSignedIn: true }
    const view = await renderRouter(routes, { initialUrl: '/start' })
    expect(view.getPathname()).toBe('/start')

    await act(async () => {
      clerkMock.setState({ isLoaded: true, isSignedIn: false })
    })

    expect(view.getPathname()).toBe('/')
  })
})

describe('tabs', () => {
  beforeEach(() => {
    clerkMock.state = { isLoaded: true, isSignedIn: true }
  })

  it('shows Início with the tab bar for a signed-in user with a check-in today', async () => {
    jest.mocked(useTodayCheckIn).mockReturnValue({
      data: TODAY_CHECK_IN,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useTodayCheckIn>)
    const startRoutes = { ...routes, '(private)/start': StartScreen }

    const view = await renderRouter(startRoutes, { initialUrl: '/start' })

    await waitFor(() => expect(view.getPathname()).toBe('/home'))
    expect(screen.getByText('home')).toBeTruthy()
    expect(screen.getByTestId('tab-bar')).toBeTruthy()
  })

  it('navigates to Planos when its tab is pressed', async () => {
    const view = await renderRouter(routes, { initialUrl: '/home' })

    await fireEvent.press(screen.getByText('Planos'))

    expect(view.getPathname()).toBe('/plans')
    expect(screen.getByText('plans')).toBeTruthy()
    expect(screen.getByTestId('tab-bar-item-plans').props.accessibilityState).toEqual({
      selected: true,
    })
  })

  it('reaches the four tabs', async () => {
    const view = await renderRouter(routes, { initialUrl: '/home' })

    await fireEvent.press(screen.getByText('Conversa'))
    expect(view.getPathname()).toBe('/conversation')
    await fireEvent.press(screen.getByText('Jornada'))
    expect(view.getPathname()).toBe('/journey')
    await fireEvent.press(screen.getByText('Início'))
    expect(view.getPathname()).toBe('/home')
  })

  it('has no tab bar on the check-in route', async () => {
    const view = await renderRouter(routes, { initialUrl: '/check-in' })

    expect(view.getPathname()).toBe('/check-in')
    expect(screen.queryByTestId('tab-bar')).toBeNull()
  })
})

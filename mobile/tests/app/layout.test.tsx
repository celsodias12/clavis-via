import { render } from '@testing-library/react-native'
import { StatusBar } from 'expo-status-bar'
import RootLayout from '../../src/app/_layout'

jest.mock('expo-status-bar', () => ({ StatusBar: jest.fn(() => null) }))
jest.mock('../../src/contexts', () => ({
  ContextProviders: ({ children }: { children: React.ReactNode }) => children,
}))
jest.mock('../../src/components/root-navigator/root-navigator.component', () => ({
  RootNavigator: () => null,
}))

describe('RootLayout', () => {
  it('renders dark status bar content for the light backgrounds', async () => {
    await render(<RootLayout />)
    expect(jest.mocked(StatusBar).mock.calls[0][0]).toEqual({ style: 'dark' })
  })
})

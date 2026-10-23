import { screen } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import Index from '../../src/app/(public)/index'
import { renderWithProviders } from '../utils/render'

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))

describe('Index route', () => {
  it('renders the welcome screen', async () => {
    jest
      .mocked(useRouter)
      .mockReturnValue({ push: jest.fn() } as unknown as ReturnType<typeof useRouter>)
    await renderWithProviders(<Index />)
    expect(screen.getByLabelText('CLAVIS VIA')).toBeTruthy()
  })
})

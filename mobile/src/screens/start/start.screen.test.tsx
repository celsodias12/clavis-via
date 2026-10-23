import { TEST_IDS, TRPC_ERROR_CODES } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server } from '@clavis-via/shared/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { StartScreen } from './start.screen'

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text: MockText } = require('react-native')
    return <MockText testID="redirect">{href}</MockText>
  },
}))

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
      title: 'Respiração guiada',
      durationSeconds: 180,
      description: 'x',
    },
  },
}

describe('StartScreen', () => {
  it('shows the key on the screen background while the check-in loads', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => null))
    await renderWithProviders(<StartScreen />)
    expect(screen.getByTestId(TEST_IDS.BRAND_KEY, { includeHiddenElements: true })).toBeTruthy()
    await waitFor(() => expect(screen.getByTestId('redirect')).toBeTruthy())
  })

  it('redirects to the check-in when there is none today', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => null))
    await renderWithProviders(<StartScreen />)
    await waitFor(() => expect(screen.getByTestId('redirect')).toHaveTextContent(ROUTES.CHECK_IN))
  })

  it('redirects to Início when there is a check-in today', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => TODAY_CHECK_IN))
    await renderWithProviders(<StartScreen />)
    await waitFor(() => expect(screen.getByTestId('redirect')).toHaveTextContent(ROUTES.HOME))
  })

  it('shows the error with a retry that fetches again', async () => {
    server.use(mockTrpcError('checkIn.latestForDate', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<StartScreen />)
    await waitFor(() => expect(screen.getByText('Tentar de novo')).toBeTruthy())
    expect(screen.queryByTestId('redirect')).toBeNull()

    server.use(mockQuery('checkIn.latestForDate', () => TODAY_CHECK_IN))
    await fireEvent.press(screen.getByText('Tentar de novo'))
    await waitFor(() => expect(screen.getByTestId('redirect')).toHaveTextContent(ROUTES.HOME))
  })
})

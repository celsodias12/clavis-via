import { TEST_IDS, TRPC_ERROR_CODES } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server } from '@clavis-via/shared/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { StartScreen } from './start.screen'

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
  it('shows the key while the check-in loads', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => null))
    const { router } = await renderWithProviders(<StartScreen />, { route: ROUTES.START })

    expect(screen.getByTestId(TEST_IDS.BRAND_KEY)).toBeTruthy()
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.CHECK_IN))
  })

  it('goes to the check-in when there is none today', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => null))
    const { router } = await renderWithProviders(<StartScreen />, { route: ROUTES.START })

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.CHECK_IN))
  })

  it('goes to Início when there is a check-in today', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => TODAY_CHECK_IN))
    const { router } = await renderWithProviders(<StartScreen />, { route: ROUTES.START })

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
  })

  it('shows the error with a retry that fetches again', async () => {
    server.use(mockTrpcError('checkIn.latestForDate', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    const { router } = await renderWithProviders(<StartScreen />, { route: ROUTES.START })
    await waitFor(() => expect(screen.getByText('Tentar de novo')).toBeTruthy())
    expect(router.state.location.pathname).toBe(ROUTES.START)

    server.use(mockQuery('checkIn.latestForDate', () => TODAY_CHECK_IN))
    fireEvent.click(screen.getByText('Tentar de novo'))

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
  })
})

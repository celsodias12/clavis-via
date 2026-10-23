import { act, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { mockQuery } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { toLocalDate } from '../../utils/date'
import { useTodayCheckIn } from './use-today-check-in'

const TODAY_CHECK_IN = {
  id: 'check-in-1',
  state: 'anxious',
  otherText: null,
  localDate: '2026-10-20',
  createdAt: '2026-10-20T12:00:00.000Z',
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

function Probe() {
  const { data, isPending } = useTodayCheckIn()
  if (isPending) {
    return <span>pending</span>
  }
  return <span>{data ? data.dailyKey.title : 'no check-in'}</span>
}

describe('useTodayCheckIn', () => {
  it('asks for the check-in of today in the device time zone', async () => {
    const received: unknown[] = []
    server.use(
      mockQuery('checkIn.latestForDate', (input) => {
        received.push(input)
        return TODAY_CHECK_IN
      }),
    )
    renderWithProviders(<Probe />)
    await waitFor(() => expect(screen.getByText('Voz e Limites')).toBeTruthy())
    expect(received).toEqual([{ localDate: toLocalDate(new Date()) }])
  })

  it('returns null data when there is no check-in today', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => null))
    renderWithProviders(<Probe />)
    await waitFor(() => expect(screen.getByText('no check-in')).toBeTruthy())
  })

  it('asks for the new day when the app returns to the foreground after midnight', async () => {
    let emitForeground: () => void = () => {}
    // Only the Date clock is frozen; timers and microtasks keep running for real.
    vi.useFakeTimers({ now: new Date(2026, 9, 19, 22), toFake: ['Date'] })
    const received: unknown[] = []
    server.use(
      mockQuery('checkIn.latestForDate', (input) => {
        received.push(input)
        return null
      }),
    )
    renderWithProviders(<Probe />, {
      subscribeToForeground: (onForeground) => {
        emitForeground = onForeground
        return () => {}
      },
    })
    await waitFor(() => expect(screen.getByText('no check-in')).toBeTruthy())

    vi.setSystemTime(new Date(2026, 9, 20, 8))
    act(() => emitForeground())

    await waitFor(() =>
      expect(received).toEqual([{ localDate: '2026-10-19' }, { localDate: '2026-10-20' }]),
    )
    await waitFor(() => expect(screen.getByText('no check-in')).toBeTruthy())
    vi.useRealTimers()
  })
})

import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { mockQuery } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { toLocalDate } from '../../utils/date'
import { useEmotionSummary } from './use-emotion-summary'

const SUMMARY = {
  period: 'month',
  points: [{ key: '2026-10-01', score: 2, state: 'anxious' }],
  insights: [{ kind: 'balanced-days' }],
}

function Probe() {
  const { data, isPending } = useEmotionSummary('month')
  if (isPending) {
    return <span>pending</span>
  }
  return <span>{`${data?.period}:${data?.points.length}`}</span>
}

describe('useEmotionSummary', () => {
  it('asks for the period with today in the device time zone', async () => {
    const received: unknown[] = []
    server.use(
      mockQuery('emotion.summary', (input) => {
        received.push(input)
        return SUMMARY
      }),
    )
    renderWithProviders(<Probe />)
    await waitFor(() => expect(screen.getByText('month:1')).toBeTruthy())
    expect(received).toEqual([{ period: 'month', localDate: toLocalDate(new Date()) }])
  })
})

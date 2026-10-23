import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { mockQuery } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { toLocalDate } from '../../utils/date'
import { useJourneyOverview } from './use-journey-overview'

const OVERVIEW = { streakDays: 3, week: [], achievements: [] }

function Probe() {
  const { data, isPending } = useJourneyOverview()
  if (isPending) {
    return <span>pending</span>
  }
  return <span>{`streak:${data?.streakDays}`}</span>
}

describe('useJourneyOverview', () => {
  it('asks for the overview with today in the device time zone', async () => {
    const received: unknown[] = []
    server.use(
      mockQuery('journey.overview', (input) => {
        received.push(input)
        return OVERVIEW
      }),
    )
    renderWithProviders(<Probe />)
    await waitFor(() => expect(screen.getByText('streak:3')).toBeTruthy())
    expect(received).toEqual([{ localDate: toLocalDate(new Date()) }])
  })
})

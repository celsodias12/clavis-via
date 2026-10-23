import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { mockQuery } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { useCurrentPlan } from './use-current-plan'

function Probe() {
  const { data, isPending } = useCurrentPlan()
  if (isPending) {
    return <span>pending</span>
  }
  return <span>{data ? `${data.title}: ${data.completedDays}/${data.totalDays}` : 'none'}</span>
}

describe('useCurrentPlan', () => {
  it('returns the plan in progress', async () => {
    server.use(
      mockQuery('plan.current', () => ({
        planId: 'when-discouragement-weighs',
        title: 'Quando o desânimo pesar',
        totalDays: 3,
        completedDays: 1,
        nextDayNumber: 2,
      })),
    )
    renderWithProviders(<Probe />)
    await waitFor(() => expect(screen.getByText('Quando o desânimo pesar: 1/3')).toBeTruthy())
  })

  it('returns null when the person has no plan in progress', async () => {
    server.use(mockQuery('plan.current', () => null))
    renderWithProviders(<Probe />)
    await waitFor(() => expect(screen.getByText('none')).toBeTruthy())
  })
})

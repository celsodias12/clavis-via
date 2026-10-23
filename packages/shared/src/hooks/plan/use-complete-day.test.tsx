import { useQuery } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { mockMutation, mockQuery } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { useApi } from '../../trpc/trpc.service'
import { useCompleteDay } from './use-complete-day'

const PLAN_ID = 'when-discouragement-weighs'

function Probe() {
  const trpc = useApi()
  useQuery(trpc.plan.current.queryOptions())
  useQuery(trpc.journey.overview.queryOptions({ localDate: '2026-10-20' }))
  useQuery(trpc.plan.detail.queryOptions({ planId: PLAN_ID }))
  useQuery(trpc.plan.day.queryOptions({ planId: PLAN_ID, dayNumber: 1 }))
  const { mutate } = useCompleteDay()
  return (
    <button
      type="button"
      onClick={() => mutate({ planId: PLAN_ID, dayNumber: 1, reflection: 'Respirei.' })}
    >
      <span>complete</span>
    </button>
  )
}

describe('useCompleteDay', () => {
  it('completes the day and refetches the plan, the day, the current plan and the journey', async () => {
    const completed = vi.fn()
    const counts = { current: 0, overview: 0, detail: 0, day: 0 }
    server.use(
      mockMutation('plan.completeDay', (input) => {
        completed(input)
        return {
          planId: PLAN_ID,
          dayNumber: 1,
          reflection: 'Respirei.',
          completedAt: '2026-10-20T12:00:00.000Z',
        }
      }),
      mockQuery('plan.current', () => {
        counts.current += 1
        return null
      }),
      mockQuery('journey.overview', () => {
        counts.overview += 1
        return null
      }),
      mockQuery('plan.detail', () => {
        counts.detail += 1
        return null
      }),
      mockQuery('plan.day', () => {
        counts.day += 1
        return null
      }),
    )
    renderWithProviders(<Probe />)
    await waitFor(() => expect(counts).toEqual({ current: 1, overview: 1, detail: 1, day: 1 }))

    fireEvent.click(screen.getByText('complete'))

    await waitFor(() =>
      expect(completed).toHaveBeenCalledWith({
        planId: PLAN_ID,
        dayNumber: 1,
        reflection: 'Respirei.',
      }),
    )
    await waitFor(() => expect(counts).toEqual({ current: 2, overview: 2, detail: 2, day: 2 }))
  })
})

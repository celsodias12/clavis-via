import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { mockMutation, mockQuery } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { useStartPlan } from './use-start-plan'

const PLAN_ID = 'when-discouragement-weighs'

function Probe() {
  const { mutate } = useStartPlan()
  return (
    <button type="button" onClick={() => mutate({ planId: PLAN_ID })}>
      <span>start</span>
    </button>
  )
}

describe('useStartPlan', () => {
  it('starts the plan and marks that plan detail and the current plan as stale', async () => {
    const started = vi.fn()
    server.use(
      mockMutation('plan.start', (input) => {
        started(input)
        return { planId: PLAN_ID, startedAt: '2026-10-20T12:00:00.000Z' }
      }),
      mockQuery('plan.detail', () => ({})),
      mockQuery('plan.current', () => null),
    )
    const { queryClient } = renderWithProviders(<Probe />)
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    fireEvent.click(screen.getByText('start'))

    await waitFor(() => expect(started).toHaveBeenCalledWith({ planId: PLAN_ID }))
    await waitFor(() => expect(invalidate).toHaveBeenCalledTimes(2))
    const keys = invalidate.mock.calls.map(([filters]) => JSON.stringify(filters?.queryKey))
    expect(keys.some((key) => key.includes('plan') && key.includes('detail'))).toBe(true)
    expect(keys.some((key) => key.includes('plan') && key.includes('current'))).toBe(true)
  })
})

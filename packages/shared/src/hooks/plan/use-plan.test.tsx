import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { mockQuery } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { usePlan } from './use-plan'

function Probe({ planId }: Readonly<{ planId: string }>) {
  const { data, isPending } = usePlan(planId)
  if (isPending) {
    return <span>pending</span>
  }
  return <span>{data?.title}</span>
}

describe('usePlan', () => {
  it('asks for the plan that was given and returns its detail', async () => {
    const requested = vi.fn()
    server.use(
      mockQuery('plan.detail', (input) => {
        requested(input)
        return { id: 'after-a-rejection', title: 'Depois de uma rejeição' }
      }),
    )
    renderWithProviders(<Probe planId="after-a-rejection" />)
    await waitFor(() => expect(screen.getByText('Depois de uma rejeição')).toBeTruthy())
    expect(requested).toHaveBeenCalledWith({ planId: 'after-a-rejection' })
  })
})

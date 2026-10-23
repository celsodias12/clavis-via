import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { mockQuery } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { usePlanDay } from './use-plan-day'

function Probe({ dayNumber }: Readonly<{ dayNumber: number }>) {
  const { data, isPending } = usePlanDay('after-a-rejection', dayNumber)
  if (isPending) {
    return <span>pending</span>
  }
  return <span>{data?.title}</span>
}

describe('usePlanDay', () => {
  it('asks for the day that was given and returns it', async () => {
    const requested = vi.fn()
    server.use(
      mockQuery('plan.day', (input) => {
        requested(input)
        return { title: 'Respirar e reconhecer' }
      }),
    )
    renderWithProviders(<Probe dayNumber={2} />)
    await waitFor(() => expect(screen.getByText('Respirar e reconhecer')).toBeTruthy())
    expect(requested).toHaveBeenCalledWith({ planId: 'after-a-rejection', dayNumber: 2 })
  })

  it('does not ask the API for a day number that is not a positive integer', async () => {
    const requested = vi.fn()
    server.use(
      mockQuery('plan.day', (input) => {
        requested(input)
        return { title: 'x' }
      }),
    )
    renderWithProviders(<Probe dayNumber={Number.NaN} />)
    expect(screen.getByText('pending')).toBeTruthy()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(requested).not.toHaveBeenCalled()
  })
})

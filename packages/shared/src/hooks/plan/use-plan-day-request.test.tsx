import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { mockQuery } from '../../../tests/utils/api-handlers'
import { renderHookWithProviders } from '../../../tests/utils/render-hook'
import { server } from '../../../tests/utils/server'
import { usePlanDayRequest } from './use-plan-day-request'

describe('usePlanDayRequest', () => {
  it('asks for the day of the route and refetches it on retry', async () => {
    let requests = 0
    server.use(
      mockQuery('plan.day', () => {
        requests += 1
        return { title: 'Dia 3' }
      }),
    )
    const leaveScreen = vi.fn()
    const { result } = renderHookWithProviders(() => usePlanDayRequest('plan-x', '3', leaveScreen))

    expect(result.current.dayNumber).toBe(3)
    expect(result.current.isValid).toBe(true)
    await waitFor(() => expect(result.current.data).toEqual({ title: 'Dia 3' }))

    await act(async () => result.current.retry())

    expect(requests).toBe(2)
    expect(leaveScreen).not.toHaveBeenCalled()
  })

  it('never asks for a day number that is not valid, and leaves the screen on retry', async () => {
    let requests = 0
    server.use(
      mockQuery('plan.day', () => {
        requests += 1
        return null
      }),
    )
    const leaveScreen = vi.fn()
    const { result } = renderHookWithProviders(() =>
      usePlanDayRequest('plan-x', 'abc', leaveScreen),
    )

    expect(result.current.isValid).toBe(false)
    act(() => {
      result.current.retry()
    })

    expect(leaveScreen).toHaveBeenCalledTimes(1)
    expect(requests).toBe(0)
  })
})

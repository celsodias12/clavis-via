import { useQuery } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { mockMutation, mockQuery } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { useApi } from '../../trpc/trpc.service'
import { useCompletePractice } from './use-complete-practice'

const LOCAL_DATE = '2026-10-20'

function Probe() {
  const trpc = useApi()
  useQuery(trpc.journey.overview.queryOptions({ localDate: LOCAL_DATE }))
  useQuery(trpc.emotion.summary.queryOptions({ period: 'week', localDate: LOCAL_DATE }))
  const { mutate } = useCompletePractice()
  return (
    <button
      type="button"
      onClick={() => mutate({ practiceId: 'guided-breathing', localDate: LOCAL_DATE })}
    >
      <span>complete</span>
    </button>
  )
}

describe('useCompletePractice', () => {
  it('records the practice and refetches the journey overview and the emotion summary', async () => {
    const completed = vi.fn()
    const counts = { overview: 0, summary: 0 }
    server.use(
      mockMutation('practice.complete', (input) => {
        completed(input)
        return { practiceId: 'guided-breathing', localDate: LOCAL_DATE }
      }),
      mockQuery('journey.overview', () => {
        counts.overview += 1
        return null
      }),
      mockQuery('emotion.summary', () => {
        counts.summary += 1
        return null
      }),
    )
    renderWithProviders(<Probe />)
    await waitFor(() => expect(counts).toEqual({ overview: 1, summary: 1 }))

    fireEvent.click(screen.getByText('complete'))

    await waitFor(() =>
      expect(completed).toHaveBeenCalledWith({
        practiceId: 'guided-breathing',
        localDate: LOCAL_DATE,
      }),
    )
    await waitFor(() => expect(counts).toEqual({ overview: 2, summary: 2 }))
  })
})

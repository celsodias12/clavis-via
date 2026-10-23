import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vite-plus/test'
import { mockMutation, mockQuery } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { useApi } from '../../trpc/trpc.service'
import { toLocalDate } from '../../utils/date'
import { useCreateCheckIn } from './use-create-check-in'
import { useTodayCheckIn } from './use-today-check-in'

function Probe() {
  const { data } = useTodayCheckIn()
  const { mutate } = useCreateCheckIn()
  return (
    <>
      <span>{data ? data.state : 'none'}</span>
      <button
        type="button"
        onClick={() => mutate({ state: 'hopeful', localDate: toLocalDate(new Date()) })}
      >
        <span>save</span>
      </button>
    </>
  )
}

describe('useCreateCheckIn', () => {
  it('refetches the check-in of the day after a successful save', async () => {
    let saved = false
    let queryCount = 0
    server.use(
      mockQuery('checkIn.latestForDate', () => {
        queryCount += 1
        return saved
          ? {
              id: 'check-in-1',
              state: 'hopeful',
              otherText: null,
              localDate: toLocalDate(new Date()),
              createdAt: '2026-10-20T12:00:00.000Z',
              dailyKey: {
                title: 't',
                text: 't',
                practice: { id: 'p', title: 'p', durationSeconds: 120, description: 'd' },
              },
            }
          : null
      }),
      mockMutation('checkIn.create', () => {
        saved = true
        return { id: 'check-in-1' }
      }),
    )
    renderWithProviders(<Probe />)
    await waitFor(() => expect(screen.getByText('none')).toBeTruthy())
    expect(queryCount).toBe(1)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.getByText('hopeful')).toBeTruthy())
    expect(queryCount).toBe(2)
  })

  it('has the saved check-in cached by the time the save settles, with nothing observing the day', async () => {
    const localDate = toLocalDate(new Date())
    const saved = {
      id: 'check-in-1',
      state: 'hopeful',
      otherText: null,
      localDate,
      createdAt: '2026-10-20T12:00:00.000Z',
      dailyKey: {
        title: 't',
        text: 't',
        practice: { id: 'p', title: 'p', durationSeconds: 1, description: 'd' },
      },
    }
    let created = false
    server.use(
      mockQuery('checkIn.latestForDate', () => (created ? saved : null)),
      mockMutation('checkIn.create', () => {
        created = true
        return { id: 'check-in-1' }
      }),
    )

    // Like Start -> Check-in -> Início: the day's query holds "no check-in" and no screen observes it.
    function SaveProbe() {
      const api = useApi()
      const queryClient = useQueryClient()
      const { mutateAsync } = useCreateCheckIn()
      const [cachedAfterSave, setCachedAfterSave] = useState('not saved')
      const save = async () => {
        // Start fetched "no check-in yet" and unmounted, which leaves the entry cached with nothing observing it.
        await queryClient.fetchQuery(api.checkIn.latestForDate.queryOptions({ localDate }))
        await mutateAsync({ state: 'hopeful', localDate })
        const cached = queryClient.getQueryData(api.checkIn.latestForDate.queryKey({ localDate }))
        setCachedAfterSave(cached === null ? 'invite' : `cached:${cached?.state}`)
      }
      return (
        <button type="button" onClick={save}>
          <span>{cachedAfterSave}</span>
        </button>
      )
    }
    renderWithProviders(<SaveProbe />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.getByText('cached:hopeful')).toBeTruthy())
  })
  it('also refetches the journey overview and the emotion summary after a successful save', async () => {
    const localDate = toLocalDate(new Date())
    const counts = { overview: 0, summary: 0 }
    server.use(
      mockQuery('journey.overview', () => {
        counts.overview += 1
        return null
      }),
      mockQuery('emotion.summary', () => {
        counts.summary += 1
        return null
      }),
      mockMutation('checkIn.create', () => ({ id: 'check-in-1' })),
    )

    function RefreshProbe() {
      const api = useApi()
      useQuery(api.journey.overview.queryOptions({ localDate }))
      useQuery(api.emotion.summary.queryOptions({ period: 'week', localDate }))
      const { mutate } = useCreateCheckIn()
      return (
        <button type="button" onClick={() => mutate({ state: 'hopeful', localDate })}>
          <span>save</span>
        </button>
      )
    }
    renderWithProviders(<RefreshProbe />)
    await waitFor(() => expect(counts).toEqual({ overview: 1, summary: 1 }))

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(counts).toEqual({ overview: 2, summary: 2 }))
  })
})

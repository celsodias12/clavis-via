import { useQuery } from '@tanstack/react-query'
import { useNow } from '../../time/use-now'
import { useApi } from '../../trpc/trpc.service'
import { toLocalDate } from '../../utils/date'

// The latest check-in of today (device time zone, followed as the day changes) with its daily key, or null when there is none yet.
export function useTodayCheckIn() {
  const trpc = useApi()
  const now = useNow()

  return useQuery(
    trpc.checkIn.latestForDate.queryOptions(
      { localDate: toLocalDate(now) },
      { trpc: { abortOnUnmount: true } },
    ),
  )
}

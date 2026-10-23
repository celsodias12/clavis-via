import { useQuery } from '@tanstack/react-query'
import { useNow } from '../../time/use-now'
import { useApi } from '../../trpc/trpc.service'
import { toLocalDate } from '../../utils/date'

// The verse of today (device time zone, followed as the day changes).
export function useVerseOfDay() {
  const trpc = useApi()
  const now = useNow()

  return useQuery(
    trpc.verse.ofDay.queryOptions(
      { localDate: toLocalDate(now) },
      { trpc: { abortOnUnmount: true } },
    ),
  )
}

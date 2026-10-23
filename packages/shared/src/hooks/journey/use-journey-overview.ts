import { useQuery } from '@tanstack/react-query'
import { useNow } from '../../time/use-now'
import { useApi } from '../../trpc/trpc.service'
import { toLocalDate } from '../../utils/date'

// The streak, the week and the achievements of Minha jornada, computed by the API for today in the device time
// zone (followed as the day changes).
export function useJourneyOverview() {
  const trpc = useApi()
  const now = useNow()

  return useQuery(
    trpc.journey.overview.queryOptions(
      { localDate: toLocalDate(now) },
      { trpc: { abortOnUnmount: true } },
    ),
  )
}

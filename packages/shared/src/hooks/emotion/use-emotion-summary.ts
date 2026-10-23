import { useQuery } from '@tanstack/react-query'
import type { EmotionPeriod } from '../../@types/emotion.type'
import { useNow } from '../../time/use-now'
import { useApi } from '../../trpc/trpc.service'
import { toLocalDate } from '../../utils/date'

// The points and insights of the check-ins of the week, month or year that contains today (device time zone,
// followed as the day changes).
export function useEmotionSummary(period: EmotionPeriod) {
  const trpc = useApi()
  const now = useNow()

  return useQuery(
    trpc.emotion.summary.queryOptions(
      { period, localDate: toLocalDate(now) },
      { trpc: { abortOnUnmount: true } },
    ),
  )
}

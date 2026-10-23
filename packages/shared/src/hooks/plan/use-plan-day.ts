import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../trpc/trpc.service'
import { isValidDayNumber } from '../../utils/plan'

// One day of a plan. A day number that is not a positive integer never reaches the API.
export function usePlanDay(planId: string, dayNumber: number) {
  const trpc = useApi()

  return useQuery(
    trpc.plan.day.queryOptions(
      { planId, dayNumber },
      { enabled: isValidDayNumber(dayNumber), trpc: { abortOnUnmount: true } },
    ),
  )
}

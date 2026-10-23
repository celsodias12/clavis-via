import { isValidDayNumber } from '../../utils/plan'
import { usePlanDay } from './use-plan-day'

// The day of a plan asked for by the route params (strings): the day number, whether it can be asked for at all,
// the query and the retry of the error state.
export function usePlanDayRequest(
  planId: string,
  routeDayNumber: string,
  leaveScreen: () => unknown,
) {
  const dayNumber = Number(routeDayNumber)
  const isValid = isValidDayNumber(dayNumber)
  const { data, isPending, isFetching, refetch } = usePlanDay(planId, dayNumber)

  // A day that cannot be asked for has nothing to retry, so the retry leaves the screen instead.
  const retry = () => (isValid ? refetch() : leaveScreen())

  return { dayNumber, isValid, data, isPending, isFetching, retry }
}

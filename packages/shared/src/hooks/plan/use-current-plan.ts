import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../trpc/trpc.service'

// The plan the person is going through with how far they have gone, or null when none is in progress.
export function useCurrentPlan() {
  const trpc = useApi()

  return useQuery(trpc.plan.current.queryOptions(undefined, { trpc: { abortOnUnmount: true } }))
}

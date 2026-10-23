import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../trpc/trpc.service'

// One plan with its days, the reflections of the person and how far they have gone.
export function usePlan(planId: string) {
  const trpc = useApi()

  return useQuery(trpc.plan.detail.queryOptions({ planId }, { trpc: { abortOnUnmount: true } }))
}

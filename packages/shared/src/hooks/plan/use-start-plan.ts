import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../../trpc/trpc.service'

// Enrolls the person in a plan (the call is idempotent) and refreshes what shows the enrollment: that
// plan's detail and the current plan. The mutation settles only after both are marked stale.
export function useStartPlan() {
  const trpc = useApi()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.plan.start.mutationOptions({
      onSuccess: (_enrollment, variables) =>
        Promise.all([
          queryClient.invalidateQueries(trpc.plan.detail.queryFilter({ planId: variables.planId })),
          queryClient.invalidateQueries(trpc.plan.current.queryFilter()),
        ]),
    }),
  )
}

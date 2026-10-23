import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../../trpc/trpc.service'

// Completes a day of a plan (the call is idempotent and enrolls the person if needed) and refreshes
// everything that shows it: the plan detail, the day, the current plan and the whole journey. The mutation
// settles only after all of them are marked stale, so the screens behind already show the day as done.
export function useCompleteDay() {
  const trpc = useApi()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.plan.completeDay.mutationOptions({
      onSuccess: (_completion, variables) =>
        Promise.all([
          queryClient.invalidateQueries(trpc.plan.detail.queryFilter({ planId: variables.planId })),
          queryClient.invalidateQueries(
            trpc.plan.day.queryFilter({ planId: variables.planId, dayNumber: variables.dayNumber }),
          ),
          queryClient.invalidateQueries(trpc.plan.current.queryFilter()),
          queryClient.invalidateQueries(trpc.journey.pathFilter()),
        ]),
    }),
  )
}

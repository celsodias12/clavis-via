import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../../trpc/trpc.service'

// Records a finished practice and refreshes what it changes: the journey (streak, week) and the emotion
// summary. The mutation settles only after both are marked stale.
export function useCompletePractice() {
  const trpc = useApi()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.practice.complete.mutationOptions({
      onSuccess: () =>
        Promise.all([
          queryClient.invalidateQueries(trpc.journey.pathFilter()),
          queryClient.invalidateQueries(trpc.emotion.pathFilter()),
        ]),
    }),
  )
}

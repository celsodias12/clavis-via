import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../../trpc/trpc.service'

// Saves a check-in and refreshes everything that shows it. The check-in of that day is loaded before the
// mutation settles, so Início (which mounts right after) already finds the key of the new state instead of a
// stale "no check-in yet" entry; the journey and the emotion summary are marked stale too.
export function useCreateCheckIn() {
  const trpc = useApi()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.checkIn.create.mutationOptions({
      onSuccess: (_checkIn, variables) =>
        Promise.all([
          // No screen observes the day's query while the check-in is open, so only refetchType 'all' reloads it.
          queryClient.invalidateQueries({
            ...trpc.checkIn.latestForDate.queryFilter({ localDate: variables.localDate }),
            refetchType: 'all',
          }),
          queryClient.invalidateQueries(trpc.journey.pathFilter()),
          queryClient.invalidateQueries(trpc.emotion.pathFilter()),
        ]),
    }),
  )
}

import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../trpc/trpc.service'

// One practice. An unknown id answers NOT_FOUND, which the screen shows as its error state.
export function usePractice(practiceId: string) {
  const trpc = useApi()

  return useQuery(
    trpc.practice.byId.queryOptions({ practiceId }, { trpc: { abortOnUnmount: true } }),
  )
}

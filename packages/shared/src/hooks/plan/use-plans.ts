import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../trpc/trpc.service'

// Every plan of the catalog, in the order the API sends them.
export function usePlans() {
  const trpc = useApi()

  return useQuery(trpc.plan.list.queryOptions(undefined, { trpc: { abortOnUnmount: true } }))
}

import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../trpc/trpc.service'

// The latest messages of the conversation, oldest first.
export function useConversationMessages() {
  const trpc = useApi()

  return useQuery(
    trpc.conversation.list.queryOptions(undefined, { trpc: { abortOnUnmount: true } }),
  )
}

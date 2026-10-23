import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ConversationMessage } from '../../@types/conversation.type'
import {
  CONVERSATION_ROLES,
  OPTIMISTIC_MESSAGE_ID_PREFIX,
} from '../../constants/conversation.constant'
import { useApi } from '../../trpc/trpc.service'

// Sends a message. The message of the person joins the list at once (with a temporary id); when the server
// answers, the list gets the stored message and the reply in its place, and on an error the temporary message is
// taken out again. The list is refetched at the end so it always matches what was stored.
export function useSendMessage() {
  const trpc = useApi()
  const queryClient = useQueryClient()

  const listKey = trpc.conversation.list.queryKey()
  const withoutOptimistic = (messages: ConversationMessage[]) =>
    messages.filter((message) => !message.id.startsWith(OPTIMISTIC_MESSAGE_ID_PREFIX))

  return useMutation(
    trpc.conversation.send.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: listKey })
        // A list that is not loaded stays as it is: there is nothing to add to yet.
        queryClient.setQueryData(listKey, (messages) =>
          messages === undefined
            ? undefined
            : [
                ...messages,
                {
                  id: `${OPTIMISTIC_MESSAGE_ID_PREFIX}${Date.now()}`,
                  role: CONVERSATION_ROLES.USER,
                  text: variables.text,
                  createdAt: new Date().toISOString(),
                },
              ],
        )
      },
      onError: () => {
        queryClient.setQueryData(listKey, (messages) =>
          messages === undefined ? undefined : withoutOptimistic(messages),
        )
      },
      onSuccess: (result) => {
        queryClient.setQueryData(listKey, (messages) =>
          messages === undefined
            ? undefined
            : [...withoutOptimistic(messages), result.userMessage, result.assistantMessage],
        )
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: listKey }),
    }),
  )
}

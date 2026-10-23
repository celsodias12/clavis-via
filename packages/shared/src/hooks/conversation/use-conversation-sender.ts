import { useRef } from 'react'
import type { QuickReply, SendMessageInput } from '../../@types/conversation.type'
import { runWithPressLock } from '../../utils/press-lock'
import { useSendMessage } from './use-send-message'

type ConversationSenderOptions = Readonly<{
  localDate: string
  // The text currently in the field, read when a send settles to know whether it is still the one that was sent.
  getFieldText: () => string
  clearField: () => void
  // The text a quick reply sends (its label in the interface language).
  getQuickReplyText: (reply: QuickReply) => string
}>

// What both clients do around useSendMessage: send a payload and, once stored, empty the field when it still holds
// that very text; send a quick reply under a synchronous lock. A failure is shown through the mutation state, so
// it is swallowed here and the text stays in the field.
export function useConversationSender({
  localDate,
  getFieldText,
  clearField,
  getQuickReplyText,
}: ConversationSenderOptions) {
  const send = useSendMessage()

  const quickReplyLock = useRef(false)

  const submitPayload = async (payload: SendMessageInput) => {
    try {
      await send.mutateAsync(payload)
      if (getFieldText().trim() === payload.text) {
        clearField()
      }
    } catch {
      // Nothing to do: send.isError drives the message.
    }
  }

  const submitText = (text: string) => submitPayload({ text, localDate })

  // Nothing is returned, so the press does not wait for the answer of the server. The synchronous lock closes the
  // window between the press and the pending state of the mutation, where a second press would send a second message.
  const selectQuickReply = (reply: QuickReply) =>
    runWithPressLock(quickReplyLock, () =>
      submitPayload({ text: getQuickReplyText(reply), localDate, intent: reply.intent }),
    )

  return { send, submitPayload, submitText, selectQuickReply }
}

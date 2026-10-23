import { z } from 'zod'
import { CONVERSATION_TEXT_MAXIMUM_LENGTH } from '../constants/conversation.constant'

// The text of a message: surrounding spaces are dropped, then it takes 1 to 1000 characters.
export const conversationFormSchema = z.object({
  text: z.string().trim().min(1).max(CONVERSATION_TEXT_MAXIMUM_LENGTH),
})

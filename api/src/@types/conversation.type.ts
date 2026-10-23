import type { z } from 'zod'
import type { CONVERSATION_ROLES, QUICK_REPLY_INTENTS } from '../constants/conversation.constant'
import type { sendMessageInputSchema } from '../schemas/conversation.schema'
import type { CheckInWithDailyKey } from './check-in.type'
import type { CurrentPlan } from './plan.type'
import type { Verse } from './verse.type'

export type ConversationRole = (typeof CONVERSATION_ROLES)[keyof typeof CONVERSATION_ROLES]

export type QuickReplyIntent = (typeof QUICK_REPLY_INTENTS)[keyof typeof QUICK_REPLY_INTENTS]

// createdAt is an ISO 8601 string because the wire format has no Date support.
export type ConversationMessage = {
  id: string
  role: ConversationRole
  text: string
  createdAt: string
}

export type SendMessageInput = z.infer<typeof sendMessageInputSchema>

export type SendMessageResult = {
  userMessage: ConversationMessage
  assistantMessage: ConversationMessage
}

// What the responder may know about the person's day, so the answer can speak about it.
export type ConversationContext = {
  todayCheckIn: CheckInWithDailyKey | null
  currentPlan: CurrentPlan | null
  verse: Verse
  // Replies already given to the person; it drives the choice among the default replies.
  assistantMessageCount: number
}

export type ConversationResponder = {
  respond: (input: {
    text: string
    intent?: QuickReplyIntent
    context: ConversationContext
  }) => Promise<string>
}

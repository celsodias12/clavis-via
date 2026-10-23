import type { QuickReplyIntent } from '../@types/conversation.type'
import type { TranslationKeys } from '../i18n/types'

// Intents the quick replies send; the simulator answers by intent because the text arrives in the interface language.
export const QUICK_REPLY_INTENTS = Object.freeze({
  TALK: 'talk',
  DIRECTION: 'direction',
  PRACTICE: 'practice',
  PRAYER: 'prayer',
} satisfies Record<string, QuickReplyIntent>)

// The four quick replies in the order of the design; each one sends its own label as the text.
export const QUICK_REPLIES = Object.freeze([
  Object.freeze({
    labelKey: 'screen.conversation.quickReplies.talk',
    intent: QUICK_REPLY_INTENTS.TALK,
  }),
  Object.freeze({
    labelKey: 'screen.conversation.quickReplies.direction',
    intent: QUICK_REPLY_INTENTS.DIRECTION,
  }),
  Object.freeze({
    labelKey: 'screen.conversation.quickReplies.practice',
    intent: QUICK_REPLY_INTENTS.PRACTICE,
  }),
  Object.freeze({
    labelKey: 'screen.conversation.quickReplies.prayer',
    intent: QUICK_REPLY_INTENTS.PRAYER,
  }),
] satisfies readonly Readonly<{ labelKey: TranslationKeys; intent: QuickReplyIntent }>[])

export const CONVERSATION_ROLES = Object.freeze({
  USER: 'user',
  ASSISTANT: 'assistant',
})

export const CONVERSATION_TEXT_MAXIMUM_LENGTH = 1000

// Ids of the messages shown before the server confirms them.
export const OPTIMISTIC_MESSAGE_ID_PREFIX = 'pending-'

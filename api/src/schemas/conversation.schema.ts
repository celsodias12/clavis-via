import { z } from 'zod'
import type { QuickReplyIntent } from '../@types/conversation.type'
import { CONVERSATION_LIMITS, QUICK_REPLY_INTENTS } from '../constants/conversation.constant'
import { localDateSchema } from './local-date.schema'

export const sendMessageInputSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(CONVERSATION_LIMITS.TEXT_MINIMUM_LENGTH)
      .max(CONVERSATION_LIMITS.TEXT_MAXIMUM_LENGTH),
    localDate: localDateSchema,
    intent: z
      .enum(Object.values(QUICK_REPLY_INTENTS) as [QuickReplyIntent, ...QuickReplyIntent[]])
      .optional(),
  })
  .strict()

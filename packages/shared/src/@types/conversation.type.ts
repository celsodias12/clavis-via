import type { AppRouter } from '@clavis-via/api/router'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { z } from 'zod'
import type { CONVERSATION_ROLES } from '../constants/conversation.constant'
import type { TranslationKeys } from '../i18n/types'
import type { conversationFormSchema } from '../validation/conversation.schema'

export type ConversationMessage = inferRouterOutputs<AppRouter>['conversation']['list'][number]
export type SendMessageInput = inferRouterInputs<AppRouter>['conversation']['send']
export type QuickReplyIntent = NonNullable<SendMessageInput['intent']>

export type ConversationRole = (typeof CONVERSATION_ROLES)[keyof typeof CONVERSATION_ROLES]

export type QuickReply = Readonly<{ labelKey: TranslationKeys; intent: QuickReplyIntent }>

export type ConversationFormInput = z.input<typeof conversationFormSchema>
export type ConversationFormValues = z.output<typeof conversationFormSchema>

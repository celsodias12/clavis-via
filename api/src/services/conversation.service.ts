import { TRPCError } from '@trpc/server'
import { and, count, desc, eq, gt, sql } from 'drizzle-orm'
import type {
  ConversationMessage,
  ConversationResponder,
  SendMessageInput,
  SendMessageResult,
} from '../@types/conversation.type'
import type { Database } from '../@types/database.type'
import {
  CONVERSATION_ERRORS,
  CONVERSATION_LIMITS,
  CONVERSATION_ROLES,
} from '../constants/conversation.constant'
import { TRPC_ERRORS } from '../constants/trpc.constant'
import { conversationMessages } from '../database/schema.database'
import type { ContentLanguage } from '../i18n/language'
import { findLatestCheckInForDate } from './check-in.service'
import { findCurrentPlan } from './plan.service'
import { findVerseOfDay } from './verse.service'

function toConversationMessage(row: typeof conversationMessages.$inferSelect): ConversationMessage {
  return {
    id: row.id,
    role: row.role,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
  }
}

// The latest messages, oldest first. Ties on created_at (same millisecond) follow insertion order through the rowid.
export async function listMessages(
  database: Database,
  userId: string,
  language: ContentLanguage = 'pt-BR',
): Promise<ConversationMessage[]> {
  const rows = await database
    .select()
    .from(conversationMessages)
    .where(
      and(eq(conversationMessages.userId, userId), eq(conversationMessages.language, language)),
    )
    .orderBy(desc(conversationMessages.createdAt), desc(sql`${conversationMessages}.rowid`))
    .limit(CONVERSATION_LIMITS.LIST_LENGTH)
  return rows.toReversed().map(toConversationMessage)
}

async function countRows(
  database: Database,
  userId: string,
  role: typeof CONVERSATION_ROLES.USER | typeof CONVERSATION_ROLES.ASSISTANT,
  since?: Date,
): Promise<number> {
  const [row] = await database
    .select({ total: count() })
    .from(conversationMessages)
    .where(
      and(
        eq(conversationMessages.userId, userId),
        eq(conversationMessages.role, role),
        since === undefined ? undefined : gt(conversationMessages.createdAt, since),
      ),
    )
  return row.total
}

async function insertMessage(
  database: Database,
  userId: string,
  role: ConversationMessage['role'],
  text: string,
  language: ContentLanguage,
): Promise<ConversationMessage> {
  const [row] = await database
    .insert(conversationMessages)
    .values({ id: crypto.randomUUID(), userId, role, language, text, createdAt: new Date() })
    .returning()
  return toConversationMessage(row)
}

// Stores the message of the person, asks the responder for the reply and stores it. The responder comes in
// as a parameter so the tests can inject a fake and a real model can replace the mock later.
export async function sendMessage(
  database: Database,
  userId: string,
  input: SendMessageInput,
  responder: ConversationResponder,
  language: ContentLanguage = 'pt-BR',
): Promise<SendMessageResult> {
  const windowStart = new Date(Date.now() - CONVERSATION_LIMITS.DAILY_WINDOW_MILLISECONDS)
  const sentInWindow = await countRows(database, userId, CONVERSATION_ROLES.USER, windowStart)
  if (sentInWindow >= CONVERSATION_LIMITS.DAILY_MESSAGE_LIMIT) {
    throw new TRPCError({
      code: TRPC_ERRORS.TOO_MANY_REQUESTS,
      message: CONVERSATION_ERRORS.DAILY_LIMIT_REACHED,
    })
  }

  const [todayCheckIn, currentPlan, verse, assistantMessageCount] = await Promise.all([
    findLatestCheckInForDate(database, userId, input.localDate, language),
    findCurrentPlan(database, userId, language),
    findVerseOfDay(database, input.localDate, language),
    countRows(database, userId, CONVERSATION_ROLES.ASSISTANT),
  ])
  const userMessage = await insertMessage(
    database,
    userId,
    CONVERSATION_ROLES.USER,
    input.text,
    language,
  )
  const replyText = await responder.respond({
    text: input.text,
    intent: input.intent,
    context: { todayCheckIn, currentPlan, verse, assistantMessageCount },
  })
  const assistantMessage = await insertMessage(
    database,
    userId,
    CONVERSATION_ROLES.ASSISTANT,
    replyText,
    language,
  )
  return { userMessage, assistantMessage }
}

import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { ConversationRole } from '../@types/conversation.type'
import type { ContentLanguage } from '../i18n/language'

export const conversationMessages = sqliteTable(
  'conversation_messages',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    role: text('role').$type<ConversationRole>().notNull(),
    language: text('language').$type<ContentLanguage>().notNull().default('pt-BR'),
    text: text('text').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('conversation_messages_user_created_index').on(table.userId, table.createdAt)],
)

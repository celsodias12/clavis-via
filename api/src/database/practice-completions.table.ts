import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { practices } from './practices.table'

export const practiceCompletions = sqliteTable(
  'practice_completions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    practiceId: text('practice_id')
      .notNull()
      .references(() => practices.id),
    localDate: text('local_date').notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('practice_completions_user_local_date_index').on(table.userId, table.localDate),
  ],
)

import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { CheckInState } from '../@types/check-in.type'

export const checkIns = sqliteTable(
  'check_ins',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    state: text('state').$type<CheckInState>().notNull(),
    otherText: text('other_text'),
    localDate: text('local_date').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('check_ins_user_local_date_index').on(table.userId, table.localDate, table.createdAt),
  ],
)

import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { plans } from './plans.table'

export const planEnrollments = sqliteTable(
  'plan_enrollments',
  {
    userId: text('user_id').notNull(),
    planId: text('plan_id')
      .notNull()
      .references(() => plans.id),
    startedAt: integer('started_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.planId] })],
)

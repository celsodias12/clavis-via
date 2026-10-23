import { foreignKey, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { planDays } from './plan-days.table'

export const dayCompletions = sqliteTable(
  'day_completions',
  {
    userId: text('user_id').notNull(),
    planId: text('plan_id').notNull(),
    dayNumber: integer('day_number').notNull(),
    reflection: text('reflection'),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.planId, table.dayNumber] }),
    foreignKey({
      columns: [table.planId, table.dayNumber],
      foreignColumns: [planDays.planId, planDays.dayNumber],
    }),
  ],
)

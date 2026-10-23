import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { plans } from './plans.table'

export const planDays = sqliteTable(
  'plan_days',
  {
    planId: text('plan_id')
      .notNull()
      .references(() => plans.id),
    dayNumber: integer('day_number').notNull(),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    message: text('message').notNull(),
    reflection: text('reflection').notNull(),
    action: text('action').notNull(),
    tip: text('tip').notNull(),
    prayer: text('prayer').notNull(),
    videoDurationSeconds: integer('video_duration_seconds').notNull(),
  },
  (table) => [primaryKey({ columns: [table.planId, table.dayNumber] })],
)

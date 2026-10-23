import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { practices } from './practices.table'

export const dailyKeys = sqliteTable('daily_keys', {
  state: text('state').primaryKey(),
  title: text('title').notNull(),
  text: text('text').notNull(),
  practiceId: text('practice_id')
    .notNull()
    .references(() => practices.id),
})

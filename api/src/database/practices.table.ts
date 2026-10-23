import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const practices = sqliteTable('practices', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  description: text('description').notNull(),
})

import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const verses = sqliteTable('verses', {
  position: integer('position').primaryKey(),
  text: text('text').notNull(),
  reference: text('reference').notNull(),
})

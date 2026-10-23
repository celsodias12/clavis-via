import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { PlanCategory } from '../@types/plan.type'

export const plans = sqliteTable('plans', {
  id: text('id').primaryKey(),
  position: integer('position').notNull().unique(),
  title: text('title').notNull(),
  category: text('category').$type<PlanCategory>().notNull(),
  description: text('description').notNull(),
})

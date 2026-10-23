import { drizzle } from 'drizzle-orm/d1'
import type { Database } from '../@types/database.type'
import * as schema from '../database/schema.database'

export function createDatabase(binding: D1Database): Database {
  return drizzle(binding, { schema })
}

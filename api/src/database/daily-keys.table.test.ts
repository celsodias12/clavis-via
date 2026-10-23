import { getTableConfig } from 'drizzle-orm/sqlite-core'
import { describe, expect, it } from 'vitest'
import { dailyKeys } from './daily-keys.table'
import { practices } from './practices.table'

describe('dailyKeys table', () => {
  it('references the practices table', () => {
    const [foreignKey] = getTableConfig(dailyKeys).foreignKeys
    const reference = foreignKey.reference()
    expect(reference.columns).toEqual([dailyKeys.practiceId])
    expect(reference.foreignColumns).toEqual([practices.id])
  })
})

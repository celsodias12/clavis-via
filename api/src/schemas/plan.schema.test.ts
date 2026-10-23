import { describe, expect, it } from 'vitest'
import { completeDayInputSchema, dayInputSchema, planInputSchema } from './plan.schema'

const PLAN_ID = 'when-discouragement-weighs'

describe('planInputSchema', () => {
  it('accepts a slug', () => {
    expect(planInputSchema.safeParse({ planId: PLAN_ID }).success).toBe(true)
  })

  it.each(['Drop Table', '', 'UPPER', 'a'.repeat(65)])('rejects %j', (planId) => {
    expect(planInputSchema.safeParse({ planId }).success).toBe(false)
  })

  it('rejects unknown keys', () => {
    expect(planInputSchema.safeParse({ planId: PLAN_ID, extra: 1 }).success).toBe(false)
  })
})

describe('dayInputSchema', () => {
  it.each([1, 30])('accepts day %d', (dayNumber) => {
    expect(dayInputSchema.safeParse({ planId: PLAN_ID, dayNumber }).success).toBe(true)
  })

  it.each([0, -1, 1.5, 31])('rejects day %d', (dayNumber) => {
    expect(dayInputSchema.safeParse({ planId: PLAN_ID, dayNumber }).success).toBe(false)
  })

  it('rejects unknown keys', () => {
    expect(dayInputSchema.safeParse({ planId: PLAN_ID, dayNumber: 1, extra: 1 }).success).toBe(
      false,
    )
  })
})

describe('completeDayInputSchema', () => {
  const base = { planId: PLAN_ID, dayNumber: 1 }

  it('accepts a missing reflection', () => {
    expect(completeDayInputSchema.parse(base).reflection).toBeUndefined()
  })

  it('trims the reflection', () => {
    expect(completeDayInputSchema.parse({ ...base, reflection: '  Respirei.  ' }).reflection).toBe(
      'Respirei.',
    )
  })

  it('turns a blank reflection into null', () => {
    expect(completeDayInputSchema.parse({ ...base, reflection: '   ' }).reflection).toBeNull()
  })

  it('accepts 1000 characters and rejects 1001', () => {
    expect(
      completeDayInputSchema.safeParse({ ...base, reflection: 'a'.repeat(1000) }).success,
    ).toBe(true)
    expect(
      completeDayInputSchema.safeParse({ ...base, reflection: 'a'.repeat(1001) }).success,
    ).toBe(false)
  })

  it('rejects unknown keys', () => {
    expect(completeDayInputSchema.safeParse({ ...base, extra: 1 }).success).toBe(false)
  })
})

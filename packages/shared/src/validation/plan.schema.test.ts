import { describe, expect, it } from 'vite-plus/test'
import { DAY_ACTION_REFLECTION_MAXIMUM_LENGTH } from '../constants/plan.constant'
import { dayActionFormSchema } from './plan.schema'

describe('dayActionFormSchema', () => {
  it('accepts an empty reflection', () => {
    expect(dayActionFormSchema.parse({ reflection: '' }).reflection).toBe('')
  })

  it('trims the surrounding spaces', () => {
    expect(dayActionFormSchema.parse({ reflection: '  Respirei.  ' }).reflection).toBe('Respirei.')
    expect(dayActionFormSchema.parse({ reflection: '   ' }).reflection).toBe('')
  })

  it('accepts 1000 characters and rejects 1001 with a translatable message', () => {
    const maximum = DAY_ACTION_REFLECTION_MAXIMUM_LENGTH
    expect(maximum).toBe(1000)
    expect(dayActionFormSchema.safeParse({ reflection: 'a'.repeat(maximum) }).success).toBe(true)
    const result = dayActionFormSchema.safeParse({ reflection: 'a'.repeat(maximum + 1) })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('screen.dayAction.errors.reflectionTooLong')
  })
})

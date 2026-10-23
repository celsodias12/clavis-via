import { describe, expect, it } from 'vite-plus/test'
import { CHECK_IN_STATES } from '../constants/check-in.constant'
import { checkInFormSchema } from './check-in.schema'

describe('checkInFormSchema', () => {
  it('requires a state', () => {
    expect(checkInFormSchema.safeParse({ otherText: '' }).success).toBe(false)
    expect(checkInFormSchema.safeParse({ state: 'unknown', otherText: '' }).success).toBe(false)
  })

  it.each(Object.values(CHECK_IN_STATES).filter((state) => state !== CHECK_IN_STATES.OTHER))(
    'accepts %s without text',
    (state) => {
      expect(checkInFormSchema.safeParse({ state, otherText: '' }).success).toBe(true)
    },
  )

  it('requires text for other, ignoring surrounding spaces', () => {
    expect(
      checkInFormSchema.safeParse({ state: CHECK_IN_STATES.OTHER, otherText: '' }).success,
    ).toBe(false)
    const spaces = checkInFormSchema.safeParse({ state: CHECK_IN_STATES.OTHER, otherText: '   ' })
    expect(spaces.success).toBe(false)
    expect(spaces.error?.issues[0].path).toEqual(['otherText'])
  })

  it('trims the text of other', () => {
    const result = checkInFormSchema.parse({
      state: CHECK_IN_STATES.OTHER,
      otherText: '  muito cansada  ',
    })
    expect(result.otherText).toBe('muito cansada')
  })

  it('accepts 280 characters and rejects 281', () => {
    const state = CHECK_IN_STATES.OTHER
    expect(checkInFormSchema.safeParse({ state, otherText: 'a'.repeat(280) }).success).toBe(true)
    expect(checkInFormSchema.safeParse({ state, otherText: 'a'.repeat(281) }).success).toBe(false)
  })
})

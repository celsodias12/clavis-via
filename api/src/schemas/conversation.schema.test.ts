import { describe, expect, it } from 'vitest'
import { sendMessageInputSchema } from './conversation.schema'

const LOCAL_DATE = new Date().toISOString().slice(0, 10)

describe('sendMessageInputSchema', () => {
  it('trims the text', () => {
    const parsed = sendMessageInputSchema.parse({ text: '  Oi  ', localDate: LOCAL_DATE })
    expect(parsed.text).toBe('Oi')
  })

  it.each(['talk', 'direction', 'practice', 'prayer'])('accepts the intent %s', (intent) => {
    expect(
      sendMessageInputSchema.safeParse({ text: 'Oi', localDate: LOCAL_DATE, intent }).success,
    ).toBe(true)
  })

  it.each(['   ', '', 'a'.repeat(1001)])('rejects the text of %j', (text) => {
    expect(sendMessageInputSchema.safeParse({ text, localDate: LOCAL_DATE }).success).toBe(false)
  })

  it('accepts 1000 characters', () => {
    expect(
      sendMessageInputSchema.safeParse({ text: 'a'.repeat(1000), localDate: LOCAL_DATE }).success,
    ).toBe(true)
  })

  it('rejects an unknown intent, a far date and unknown keys', () => {
    expect(
      sendMessageInputSchema.safeParse({ text: 'Oi', localDate: LOCAL_DATE, intent: 'other' })
        .success,
    ).toBe(false)
    expect(sendMessageInputSchema.safeParse({ text: 'Oi', localDate: '2020-01-01' }).success).toBe(
      false,
    )
    expect(
      sendMessageInputSchema.safeParse({ text: 'Oi', localDate: LOCAL_DATE, extra: 1 }).success,
    ).toBe(false)
  })
})

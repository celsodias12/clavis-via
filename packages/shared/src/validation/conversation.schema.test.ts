import { describe, expect, it } from 'vite-plus/test'
import { CONVERSATION_TEXT_MAXIMUM_LENGTH } from '../constants/conversation.constant'
import { conversationFormSchema } from './conversation.schema'

describe('conversationFormSchema', () => {
  it('trims the text', () => {
    expect(conversationFormSchema.parse({ text: '  Oi  ' }).text).toBe('Oi')
  })

  it('rejects an empty or blank text', () => {
    expect(conversationFormSchema.safeParse({ text: '' }).success).toBe(false)
    expect(conversationFormSchema.safeParse({ text: '   ' }).success).toBe(false)
  })

  it('accepts 1000 characters and rejects 1001', () => {
    const maximum = CONVERSATION_TEXT_MAXIMUM_LENGTH
    expect(maximum).toBe(1000)
    expect(conversationFormSchema.safeParse({ text: 'a'.repeat(maximum) }).success).toBe(true)
    expect(conversationFormSchema.safeParse({ text: 'a'.repeat(maximum + 1) }).success).toBe(false)
  })
})

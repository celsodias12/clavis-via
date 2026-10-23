import { describe, expect, it } from 'vite-plus/test'
import { VALIDATION_MESSAGE_KEYS } from '../constants/authentication.constant'
import { signInFormSchema, signUpFormSchema } from './authentication.schema'

describe('signUpFormSchema', () => {
  it('trims the name and the email and lowercases the email', () => {
    expect(
      signUpFormSchema.parse({
        firstName: ' Ana ',
        emailAddress: ' Ana@Email.COM ',
        password: '12345678',
      }),
    ).toEqual({ firstName: 'Ana', emailAddress: 'ana@email.com', password: '12345678' })
  })

  it('rejects an empty name, an invalid email and a short password', () => {
    const result = signUpFormSchema.safeParse({ firstName: '', emailAddress: 'x', password: '123' })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((issue) => issue.message)
    expect(messages).toEqual([
      VALIDATION_MESSAGE_KEYS.FIRST_NAME_REQUIRED,
      VALIDATION_MESSAGE_KEYS.EMAIL_INVALID,
      VALIDATION_MESSAGE_KEYS.PASSWORD_TOO_SHORT,
    ])
  })

  it('rejects a name above 64 characters and a password above 72', () => {
    const result = signUpFormSchema.safeParse({
      firstName: 'a'.repeat(65),
      emailAddress: 'ana@email.com',
      password: 'p'.repeat(73),
    })
    const messages = result.error?.issues.map((issue) => issue.message)
    expect(messages).toEqual([
      VALIDATION_MESSAGE_KEYS.FIRST_NAME_TOO_LONG,
      VALIDATION_MESSAGE_KEYS.PASSWORD_TOO_LONG,
    ])
  })

  it('accepts the boundary lengths', () => {
    expect(
      signUpFormSchema.safeParse({
        firstName: 'a'.repeat(64),
        emailAddress: 'ana@email.com',
        password: 'p'.repeat(72),
      }).success,
    ).toBe(true)
  })

  it('treats a name made only of spaces as empty', () => {
    const result = signUpFormSchema.safeParse({
      firstName: '   ',
      emailAddress: 'ana@email.com',
      password: '12345678',
    })
    expect(result.error?.issues[0]?.message).toBe(VALIDATION_MESSAGE_KEYS.FIRST_NAME_REQUIRED)
  })
})

describe('signInFormSchema', () => {
  it('trims and lowercases the email and keeps the password untouched', () => {
    expect(
      signInFormSchema.parse({ emailAddress: ' Ana@Email.COM ', password: ' segredo ' }),
    ).toEqual({ emailAddress: 'ana@email.com', password: ' segredo ' })
  })

  it('requires a valid email and at least one password character', () => {
    const result = signInFormSchema.safeParse({ emailAddress: 'x', password: '' })
    const messages = result.error?.issues.map((issue) => issue.message)
    expect(messages).toEqual([
      VALIDATION_MESSAGE_KEYS.EMAIL_INVALID,
      VALIDATION_MESSAGE_KEYS.PASSWORD_REQUIRED,
    ])
  })
})

import { describe, expect, it } from 'vitest'
import { extractBearerToken } from './authorization'

describe('extractBearerToken', () => {
  it('returns the token of a Bearer header', () => {
    expect(extractBearerToken('Bearer abc')).toBe('abc')
  })

  it('returns null without a header', () => {
    expect(extractBearerToken(undefined)).toBeNull()
  })

  it('returns null for another scheme', () => {
    expect(extractBearerToken('Basic abc')).toBeNull()
  })

  it('returns null for an empty token', () => {
    expect(extractBearerToken('Bearer ')).toBeNull()
  })
})

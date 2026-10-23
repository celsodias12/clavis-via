import { describe, expect, it } from 'vite-plus/test'
import { translateFormError } from './form-errors'

describe('translateFormError', () => {
  const translate = (key: string) => `translated:${key}`

  it('translates the message as a translation key', () => {
    expect(translateFormError(translate, 'screen.authentication.errors.generic')).toBe(
      'translated:screen.authentication.errors.generic',
    )
  })

  it('returns undefined when there is no message', () => {
    expect(translateFormError(translate, undefined)).toBeUndefined()
    expect(translateFormError(translate, '')).toBeUndefined()
  })
})

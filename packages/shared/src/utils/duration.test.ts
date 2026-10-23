import { describe, expect, it } from 'vite-plus/test'
import { SUPPORTED_LANGUAGES } from '../constants/language.constant'
import { createI18n } from '../i18n/config'
import { formatClock, formatPracticeDuration } from './duration'

describe('formatClock', () => {
  it('writes seconds as minutes and two digit seconds', () => {
    expect(formatClock(138)).toBe('2:18')
    expect(formatClock(180)).toBe('3:00')
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(9)).toBe('0:09')
  })
})

describe('formatPracticeDuration', () => {
  const i18n = createI18n(SUPPORTED_LANGUAGES.PORTUGUESE)

  it('writes whole minutes with their plural', () => {
    expect(formatPracticeDuration(180, i18n.t)).toBe('3 minutos')
    expect(formatPracticeDuration(60, i18n.t)).toBe('1 minuto')
  })

  it('writes minutes and seconds when the length is not a whole number of minutes', () => {
    expect(formatPracticeDuration(150, i18n.t)).toBe('2 min 30 s')
  })

  it('follows the language of the translate function', () => {
    const english = i18n.getFixedT(SUPPORTED_LANGUAGES.ENGLISH)
    expect(formatPracticeDuration(60, english)).toBe('1 minute')
    expect(formatPracticeDuration(180, english)).toBe('3 minutes')
  })
})

import { describe, expect, it } from 'vite-plus/test'
import * as shared from './index'

describe('shared package', () => {
  it('exports the domain constants, the visual tokens, the utilities and the schemas', () => {
    expect(shared.CHECK_IN_STATES.HEAVY).toBe('heavy')
    expect(shared.TEST_IDS.TAB_BAR).toBe('tab-bar')
    expect(shared.colors.brand).toBe('#23345e')
    expect(shared.fonts.brand).toBe('Jost_300Light')
    expect(shared.HEADER_ICON_PATHS.BACK).toBeTypeOf('string')
    expect(shared.EMOTION_SHAPES.heavy.length).toBeGreaterThan(0)
    expect(shared.toLocalDate).toBeTypeOf('function')
    expect(shared.formatClock(138)).toBe('2:18')
    expect(shared.checkInFormSchema).toBeDefined()
    expect(shared.createI18n(null).t('common.comingSoon')).toBe('Em breve')
    expect(shared.ptBr).toBeDefined()
  })
})

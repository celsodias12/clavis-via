import { describe, expect, it } from 'vite-plus/test'
import { createI18n } from './config'
import { en, es, ptBr } from './locales'

type Tree = { [key: string]: string | Tree }

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tree).flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key
      return typeof value === 'string' ? [[path, value]] : Object.entries(flatten(value, path))
    }),
  )
}

describe('createI18n', () => {
  it('translates to every supported language', () => {
    const i18n = createI18n(null)
    expect(i18n.getFixedT('pt-BR')('common.comingSoon')).toBe('Em breve')
    expect(i18n.getFixedT('es')('common.comingSoon')).toBe('Próximamente')
    expect(i18n.getFixedT('en')('common.comingSoon')).toBe('Coming soon')
  })

  it('starts in the language of the tag', () => {
    expect(createI18n('es-MX').t('common.comingSoon')).toBe('Próximamente')
    expect(createI18n('en-US').t('common.comingSoon')).toBe('Coming soon')
  })

  it('falls back to Portuguese when there is no tag or an unsupported one', () => {
    expect(createI18n(null).t('common.comingSoon')).toBe('Em breve')
    expect(createI18n('fr-FR').t('common.comingSoon')).toBe('Em breve')
  })

  it('keeps the same key set in the three locales', () => {
    expect(Object.keys(flatten(en))).toEqual(Object.keys(flatten(ptBr)))
    expect(Object.keys(flatten(es))).toEqual(Object.keys(flatten(ptBr)))
  })
})

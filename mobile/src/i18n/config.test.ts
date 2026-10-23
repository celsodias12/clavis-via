import type { i18n as I18nInstance } from 'i18next'

// Loads a fresh i18n instance with the device locales stubbed.
function loadI18nWithLocales(locales: { languageTag: string }[]) {
  let loaded: I18nInstance | undefined
  jest.isolateModules(() => {
    jest.doMock('expo-localization', () => ({ getLocales: () => locales }))
    loaded = require('./config').i18n
  })
  return loaded as I18nInstance
}

describe('i18n', () => {
  it('starts in the device language', () => {
    expect(loadI18nWithLocales([{ languageTag: 'es-MX' }]).t('common.comingSoon')).toBe(
      'Próximamente',
    )
  })

  it('uses the next supported preference when the first device language is unsupported', () => {
    expect(
      loadI18nWithLocales([{ languageTag: 'fr-FR' }, { languageTag: 'en-GB' }]).t(
        'common.comingSoon',
      ),
    ).toBe('Coming soon')
  })

  it('falls back to Portuguese when the device has no locale or an unsupported one', () => {
    expect(loadI18nWithLocales([]).t('common.comingSoon')).toBe('Em breve')
    expect(loadI18nWithLocales([{ languageTag: 'fr-FR' }]).t('common.comingSoon')).toBe('Em breve')
  })
})

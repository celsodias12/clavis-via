import { act, render, screen, waitFor } from '@testing-library/react-native'
import * as Localization from 'expo-localization'
import { useTranslation } from 'react-i18next'
import { AppState, type AppStateStatus, Text } from 'react-native'
import { ContextProviders } from '../../src/contexts'
import { i18n } from '../../src/i18n/config'

const deviceLocale = Localization.getLocales()[0]
const listeners = new Set<(status: AppStateStatus) => void>()

function setLocales(firstTag: string, ...otherTags: string[]) {
  const localeFor = (languageTag: string) => ({
    ...deviceLocale,
    languageTag,
    languageCode: languageTag.split('-')[0],
  })
  jest
    .spyOn(Localization, 'getLocales')
    .mockReturnValue([localeFor(firstTag), ...otherTags.map(localeFor)])
}

async function emitAppState(status: AppStateStatus) {
  await act(async () => {
    for (const listener of listeners) listener(status)
  })
}

function Probe() {
  const { t } = useTranslation()
  return <Text>{t('common.comingSoon')}</Text>
}

async function renderApp() {
  return render(
    <ContextProviders>
      <Probe />
    </ContextProviders>,
  )
}

beforeEach(() => {
  listeners.clear()
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
    listeners.add(listener)
    return { remove: () => listeners.delete(listener) }
  })
})

afterEach(async () => {
  jest.restoreAllMocks()
  await act(() => i18n.changeLanguage('pt-BR'))
})

it('reads the current locale when the app mounts', async () => {
  setLocales('en-US')
  const view = await renderApp()
  expect(screen.getByText('Coming soon')).toBeTruthy()
  await view.unmount()
})

it('follows the first supported preference when returning to the foreground', async () => {
  setLocales('en-US')
  await i18n.changeLanguage('en')
  const view = await renderApp()
  expect(screen.getByText('Coming soon')).toBeTruthy()
  await emitAppState('background')
  setLocales('fr-FR', 'es-MX')

  await emitAppState('active')

  await waitFor(() => expect(screen.getByText('Próximamente')).toBeTruthy())
  await view.unmount()
})

it('falls back to Portuguese when no preferred language is supported', async () => {
  setLocales('es-ES')
  await i18n.changeLanguage('es')
  const view = await renderApp()
  setLocales('fr-FR')

  await emitAppState('active')

  await waitFor(() => expect(screen.getByText('Em breve')).toBeTruthy())
  await view.unmount()
})

it('stops following device preferences after unmount', async () => {
  setLocales('en-US')
  await i18n.changeLanguage('en')
  const view = await renderApp()
  await view.unmount()
  setLocales('es-ES')

  await emitAppState('active')

  expect(i18n.language).toBe('en')
})

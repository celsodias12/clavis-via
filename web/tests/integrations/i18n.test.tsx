import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vite-plus/test'
import { App } from '../../src/components/app/app.component'
import { i18n } from '../../src/configs/i18n.config'

function setLanguages(languages: string[]) {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages)
}

async function emitLanguageChange(languages: string[]) {
  setLanguages(languages)
  await act(async () => window.dispatchEvent(new Event('languagechange')))
}

afterEach(async () => {
  vi.restoreAllMocks()
  await act(() => i18n.changeLanguage('pt-BR'))
})

it('reads current browser preferences when the app mounts', async () => {
  setLanguages(['en-US'])
  render(<App />)

  expect(await screen.findByText('Start my journey')).toBeTruthy()
  expect(document.documentElement.lang).toBe('en')
  expect(screen.getByRole('region', { name: 'Notifications alt+T' })).toBeTruthy()
})

it('updates the mounted app and document language after browser preferences change', async () => {
  setLanguages(['pt-BR'])
  render(<App />)
  await screen.findByText('Começar minha jornada')
  expect(screen.getByRole('region', { name: 'Notificações alt+T' })).toBeTruthy()

  await emitLanguageChange(['fr-FR', 'es-MX'])

  expect(await screen.findByText('Comenzar mi viaje')).toBeTruthy()
  expect(document.documentElement.lang).toBe('es')
  expect(screen.getByRole('region', { name: 'Notificaciones alt+T' })).toBeTruthy()
  expect(screen.queryByText('Começar minha jornada')).toBeNull()
})

it('falls back to Portuguese if the browser reports no supported preference', async () => {
  setLanguages(['es-ES'])
  await i18n.changeLanguage('es')
  render(<App />)
  await screen.findByText('Comenzar mi viaje')

  await emitLanguageChange(['fr-FR'])

  expect(await screen.findByText('Começar minha jornada')).toBeTruthy()
  expect(document.documentElement.lang).toBe('pt-BR')
})

it('stops following browser language changes after unmount', async () => {
  setLanguages(['pt-BR'])
  const view = render(<App />)
  await screen.findByText('Começar minha jornada')
  view.unmount()

  await emitLanguageChange(['en-US'])

  await waitFor(() => expect(i18n.language).toBe('pt-BR'))
})

import { PROFILE_MENU_ITEMS, TEST_IDS } from '@clavis-via/shared'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { clerkMock } from '../../../tests/utils/clerk-mock'
import { renderApp, renderWithProviders } from '../../../tests/utils/render'
import { setViewportWidth } from '../../../tests/utils/viewport'
import { ROUTES } from '../../constants/route.constant'
import { ProfileScreen } from './profile.screen'

vi.mock('sonner', () => ({ toast: vi.fn() }))

const PHONE_WIDTH = 390
const MENU_LABELS = [
  'Minha assinatura',
  'Configurações',
  'Notificações',
  'Privacidade',
  'Central de ajuda',
]

function signInAs(user: { firstName: string | null; hasImage: boolean }) {
  clerkMock.user = { imageUrl: 'https://img.test/ana.png', ...user }
  clerkMock.state = { isLoaded: true, isSignedIn: true, userId: 'user-1' }
}

beforeEach(() => {
  vi.mocked(toast).mockClear()
  signInAs({ firstName: 'Ana', hasImage: true })
})

describe('ProfileScreen', () => {
  it('shows the title, the photo, the name, the subtitle, the purpose and the six items', async () => {
    await renderWithProviders(<ProfileScreen />)

    expect(screen.getByRole('heading', { level: 1, name: 'Meu perfil' })).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.USER_AVATAR_IMAGE).getAttribute('src')).toBe(
      'https://img.test/ana.png',
    )
    expect(screen.getByTestId(TEST_IDS.PROFILE_NAME).textContent).toBe('Ana')
    expect(screen.getByText('Em jornada de reconstrução')).toBeTruthy()
    expect(screen.getByText('Meu propósito')).toBeTruthy()
    expect(
      screen.getByText('Viver uma vida alinhada com quem eu sou, com leveza, fé e direção.'),
    ).toBeTruthy()
    for (const label of [...MENU_LABELS, 'Sair']) {
      expect(screen.getAllByRole('button', { name: label }).length).toBeGreaterThan(0)
    }
  })

  it('shows the initial of the name when there is no photo', async () => {
    signInAs({ firstName: 'Ana', hasImage: false })
    await renderWithProviders(<ProfileScreen />)

    expect(screen.getByTestId(TEST_IDS.USER_AVATAR_INITIAL).textContent).toBe('A')
  })

  it('shows an empty name when the user has none', async () => {
    signInAs({ firstName: null, hasImage: false })
    await renderWithProviders(<ProfileScreen />)

    expect(screen.getByTestId(TEST_IDS.PROFILE_NAME).textContent).toBe('')
  })

  it('shows an empty name while there is no user', async () => {
    clerkMock.user = null
    await renderWithProviders(<ProfileScreen />)

    expect(screen.getByTestId(TEST_IDS.PROFILE_NAME).textContent).toBe('')
  })

  it('points the gear, the pencil and the five menu items to the coming soon notice', async () => {
    await renderWithProviders(<ProfileScreen />)

    fireEvent.click(screen.getByRole('button', { name: 'Alterar foto' }))
    // The header gear comes first in the tree and shares its label with the "Configurações" item.
    fireEvent.click(screen.getAllByRole('button', { name: 'Configurações' })[0])
    for (const item of PROFILE_MENU_ITEMS) {
      fireEvent.click(screen.getByTestId(item.testID))
    }

    expect(toast).toHaveBeenCalledTimes(7)
    expect(clerkMock.signOut).not.toHaveBeenCalled()
  })

  it('keeps the app header with a back arrow on a phone', async () => {
    setViewportWidth(PHONE_WIDTH)
    const { router } = await renderApp({ route: ROUTES.PROFILE })

    expect(screen.getByRole('heading', { level: 1, name: 'Meu perfil' })).toBeTruthy()
    fireEvent.click(screen.getAllByRole('button', { name: 'Configurações' })[0])
    expect(toast).toHaveBeenCalledTimes(1)

    // A direct visit has no page of the app to go back to, so the arrow goes to Início.
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
  })

  it('signs out once even when clicked twice, and stays locked while it runs', async () => {
    let finish = () => {}
    clerkMock.signOut.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        }),
    )
    await renderWithProviders(<ProfileScreen />)
    const signOutRow = screen.getByTestId(TEST_IDS.PROFILE_SIGN_OUT)

    // Both clicks land before React re-renders the item as disabled: only the lock stops the second.
    await act(async () => {
      fireEvent.click(signOutRow)
      fireEvent.click(signOutRow)
    })

    expect(clerkMock.signOut).toHaveBeenCalledTimes(1)
    expect((signOutRow as HTMLButtonElement).disabled).toBe(true)
    await act(async () => finish())
  })

  it('unlocks the item when signing out fails, so the user can try again', async () => {
    clerkMock.signOut.mockRejectedValueOnce(new Error('network'))
    await renderWithProviders(<ProfileScreen />)
    const signOutRow = screen.getByTestId(TEST_IDS.PROFILE_SIGN_OUT) as HTMLButtonElement

    fireEvent.click(signOutRow)
    await waitFor(() => expect(signOutRow.disabled).toBe(false))
    fireEvent.click(signOutRow)

    expect(clerkMock.signOut).toHaveBeenCalledTimes(2)
  })

  // The lazy welcome screen is slow to load under a parallel run.
  it('on sign out clears the cache and returns to the welcome page; /home then redirects to it', {
    timeout: 15000,
  }, async () => {
    clerkMock.signOut.mockImplementationOnce(async () => {
      clerkMock.setState({ isLoaded: true, isSignedIn: false })
    })
    const { router, queryClient } = await renderApp({ route: ROUTES.PROFILE })
    queryClient.setQueryData(['account-data'], { name: 'Ana' })
    expect(queryClient.getQueryCache().getAll()).toHaveLength(1)

    fireEvent.click(await screen.findByTestId(TEST_IDS.PROFILE_SIGN_OUT))

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.WELCOME))
    expect(clerkMock.signOut).toHaveBeenCalledTimes(1)
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
    // Back must not show the previous account: its entry is gone and a private route sends the visitor away.
    expect(router.history.location.pathname).toBe(ROUTES.WELCOME)
    expect(await screen.findByTestId(TEST_IDS.WELCOME_START, {}, { timeout: 10000 })).toBeTruthy()
    await act(async () => router.navigate({ to: ROUTES.HOME }))
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.WELCOME), {
      timeout: 10000,
    })
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
  })
})

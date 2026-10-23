import { PROFILE_MENU_ITEMS, TEST_IDS } from '@clavis-via/shared'
import { useUser } from '@clerk/expo'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { ToastAndroid } from 'react-native'
import { clerkMock } from '../../../tests/utils/clerk-mock'
import { renderWithProviders } from '../../../tests/utils/render'
import { ProfileScreen } from './profile.screen'

jest.mock('@clerk/expo', () => require('../../../tests/utils/clerk-mock').clerkModule)
jest.mock('expo-router', () => ({ useRouter: jest.fn() }))

const MENU_LABELS = [
  'Minha assinatura',
  'Configurações',
  'Notificações',
  'Privacidade',
  'Central de ajuda',
]

function mockUser(user: { firstName: string | null; hasImage: boolean }) {
  jest.mocked(useUser).mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: { imageUrl: 'https://img.test/ana.png', ...user },
  } as unknown as ReturnType<typeof useUser>)
}

describe('ProfileScreen', () => {
  const back = jest.fn()
  let toast: jest.SpyInstance

  beforeEach(() => {
    back.mockClear()
    clerkMock.reset()
    jest.mocked(useRouter).mockReturnValue({ back } as unknown as ReturnType<typeof useRouter>)
    toast = jest.spyOn(ToastAndroid, 'show').mockImplementation(() => {})
    mockUser({ firstName: 'Ana', hasImage: true })
  })

  afterEach(() => {
    toast.mockRestore()
  })

  it('shows the header, the photo, the name, the subtitle, the purpose and the six items', async () => {
    await renderWithProviders(<ProfileScreen />)
    expect(screen.getByText('Meu perfil')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.USER_AVATAR_IMAGE).props.source).toEqual({
      uri: 'https://img.test/ana.png',
    })
    expect(screen.getByTestId(TEST_IDS.PROFILE_NAME)).toHaveTextContent('Ana')
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
    mockUser({ firstName: 'Ana', hasImage: false })
    await renderWithProviders(<ProfileScreen />)
    expect(screen.getByTestId(TEST_IDS.USER_AVATAR_INITIAL)).toHaveTextContent('A')
  })

  it('shows an empty name when the user has none', async () => {
    mockUser({ firstName: null, hasImage: false })
    await renderWithProviders(<ProfileScreen />)
    expect(screen.getByTestId(TEST_IDS.PROFILE_NAME)).toHaveTextContent('')
  })

  it('shows an empty name while the user is not loaded', async () => {
    jest
      .mocked(useUser)
      .mockReturnValue({ isLoaded: false, isSignedIn: undefined, user: undefined } as ReturnType<
        typeof useUser
      >)
    await renderWithProviders(<ProfileScreen />)
    expect(screen.getByTestId(TEST_IDS.PROFILE_NAME)).toHaveTextContent('')
  })

  it('goes back with the arrow', async () => {
    await renderWithProviders(<ProfileScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }))
    expect(back).toHaveBeenCalledTimes(1)
  })

  it('points the gear, the pencil and the five menu items to the coming soon notice', async () => {
    await renderWithProviders(<ProfileScreen />)
    // The header gear comes first in the tree and shares its label with the "Configurações" item.
    await fireEvent.press(screen.getAllByRole('button', { name: 'Configurações' })[0])
    await fireEvent.press(screen.getByRole('button', { name: 'Alterar foto' }))
    for (const item of PROFILE_MENU_ITEMS) {
      await fireEvent.press(screen.getByTestId(item.testID))
    }
    expect(toast).toHaveBeenCalledTimes(7)
    expect(clerkMock.signOut).not.toHaveBeenCalled()
  })

  it('signs out once even when pressed twice, and stays locked while it runs', async () => {
    let finish = () => {}
    clerkMock.signOut.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        }),
    )
    await renderWithProviders(<ProfileScreen />)
    const signOut = screen.getByTestId(TEST_IDS.PROFILE_SIGN_OUT)
    // Both taps land before React re-renders the item as disabled: only the lock in the handler stops the second.
    await act(async () => {
      fireEvent.press(signOut)
      fireEvent.press(signOut)
    })
    expect(clerkMock.signOut).toHaveBeenCalledTimes(1)
    await fireEvent.press(signOut)
    expect(clerkMock.signOut).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId(TEST_IDS.PROFILE_SIGN_OUT).props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    )
    await act(async () => finish())
  })

  it('unlocks the item when signing out fails, so the user can try again', async () => {
    clerkMock.signOut.mockRejectedValueOnce(new Error('network'))
    await renderWithProviders(<ProfileScreen />)
    await fireEvent.press(screen.getByTestId(TEST_IDS.PROFILE_SIGN_OUT))
    await act(async () => {})
    expect(screen.getByTestId(TEST_IDS.PROFILE_SIGN_OUT).props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    )
    await fireEvent.press(screen.getByTestId(TEST_IDS.PROFILE_SIGN_OUT))
    expect(clerkMock.signOut).toHaveBeenCalledTimes(2)
  })
})

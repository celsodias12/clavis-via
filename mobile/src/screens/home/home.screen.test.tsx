import { TEST_IDS, TRPC_ERROR_CODES } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { useUser } from '@clerk/expo'
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { HttpResponse, http } from 'msw/http'
import { AppState, type AppStateStatus, ToastAndroid } from 'react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { HomeScreen } from './home.screen'

jest.mock('@clerk/expo', () => require('../../../tests/utils/clerk-mock').clerkModule)
jest.mock('expo-router', () => ({ useRouter: jest.fn() }))
jest.mock(
  'react-native-reanimated',
  () => require('../../../tests/utils/reanimated-mock').reanimatedModule,
)

const ANXIOUS_CHECK_IN = {
  id: 'check-in-1',
  state: 'anxious',
  otherText: null,
  localDate: '2026-10-19',
  createdAt: '2026-10-19T12:00:00.000Z',
  dailyKey: {
    title: 'Voz e Limites',
    text: 'Talvez hoje você não precise explicar tanto. Comece reconhecendo o que é verdadeiro para você.',
    practice: {
      id: 'guided-breathing',
      title: 'Respiração guiada',
      durationSeconds: 180,
      description: 'x',
    },
  },
}

const VERSE = {
  text: 'Porque eu bem sei os planos que tenho para vocês',
  reference: 'Jeremias 29:11',
}

const CURRENT_PLAN = {
  planId: 'when-discouragement-weighs',
  title: 'Quando o desânimo pesar',
  totalDays: 3,
  completedDays: 1,
  nextDayNumber: 2,
}

type MockUser = { firstName: string | null; hasImage: boolean; imageUrl: string }

function mockUser(user: Partial<MockUser> = {}) {
  jest.mocked(useUser).mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: { firstName: 'Ana', hasImage: false, imageUrl: 'https://img.test/ana.png', ...user },
  } as unknown as ReturnType<typeof useUser>)
}

// Only the Date clock is frozen; timers and microtasks keep running for real.
function freezeDateAt(year: number, month: number, day: number, hours: number) {
  jest.useFakeTimers({
    now: new Date(year, month, day, hours, 0),
    doNotFake: [
      'hrtime',
      'nextTick',
      'performance',
      'queueMicrotask',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'requestIdleCallback',
      'cancelIdleCallback',
      'setImmediate',
      'clearImmediate',
      'setInterval',
      'clearInterval',
      'setTimeout',
      'clearTimeout',
    ],
  })
}

// Renders and waits for the key, so no request is still in flight when the handlers are reset.
async function renderHomeLoaded() {
  await renderWithProviders(<HomeScreen />)
  await screen.findByText('Voz e Limites')
  await screen.findByText('Quando o desânimo pesar')
  await screen.findByText(/Jeremias 29:11/)
}

describe('HomeScreen', () => {
  const push = jest.fn()
  let toast: jest.SpyInstance

  beforeEach(() => {
    push.mockReset()
    jest.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>)
    toast = jest.spyOn(ToastAndroid, 'show').mockImplementation(() => {})
    mockUser()
    freezeDateAt(2026, 9, 19, 9)
    server.use(
      mockQuery('checkIn.latestForDate', () => ANXIOUS_CHECK_IN),
      mockQuery('verse.ofDay', () => VERSE),
      mockQuery('plan.current', () => CURRENT_PLAN),
    )
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    toast.mockRestore()
  })

  it('greets by name in the morning with the subtitle', async () => {
    await renderHomeLoaded()
    expect(screen.getByText('Bom dia, Ana')).toBeTruthy()
    expect(screen.getByText('Que bom ter você aqui hoje.')).toBeTruthy()
    expect(screen.getByLabelText('CLAVIS VIA')).toBeTruthy()
  })

  it.each([
    [14, 'Boa tarde, Ana'],
    [20, 'Boa noite, Ana'],
  ])('greets at %i:00 with %s', async (hours, expected) => {
    freezeDateAt(2026, 9, 19, hours)
    await renderHomeLoaded()
    expect(screen.getByText(expected)).toBeTruthy()
  })

  it('updates the greeting and the day when the app returns to the foreground', async () => {
    const listeners: ((status: AppStateStatus) => void)[] = []
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
      listeners.push(listener as (status: AppStateStatus) => void)
      return { remove: jest.fn() }
    })
    const requestedDates: string[] = []
    server.use(
      mockQuery('checkIn.latestForDate', (input) => {
        requestedDates.push((input as { localDate: string }).localDate)
        return ANXIOUS_CHECK_IN
      }),
    )
    await renderHomeLoaded()
    expect(screen.getByText('Bom dia, Ana')).toBeTruthy()

    // The phone stayed on overnight: the app resumes the next evening without any re-render of its own.
    freezeDateAt(2026, 9, 20, 20)
    await act(async () => {
      for (const listener of listeners) {
        listener('active')
      }
    })

    await waitFor(() => expect(screen.getByText('Boa noite, Ana')).toBeTruthy())
    await waitFor(() => expect(requestedDates).toEqual(['2026-10-19', '2026-10-20']))
    await screen.findByText('Voz e Limites')
  })

  it('drops the comma when there is no first name', async () => {
    mockUser({ firstName: null })
    await renderHomeLoaded()
    expect(screen.getByText('Bom dia')).toBeTruthy()
  })

  it('drops the comma when there is no user yet', async () => {
    jest.mocked(useUser).mockReturnValue({
      isLoaded: false,
      isSignedIn: undefined,
      user: undefined,
    } as unknown as ReturnType<typeof useUser>)
    await renderHomeLoaded()
    expect(screen.getByText('Bom dia')).toBeTruthy()
  })

  it('keeps a very long first name on a single line', async () => {
    mockUser({ firstName: 'A'.repeat(60) })
    await renderHomeLoaded()
    const greeting = screen.getByTestId(TEST_IDS.HOME_GREETING)
    expect(greeting.props.numberOfLines).toBe(1)
    expect(greeting.props.ellipsizeMode).toBe('tail')
  })

  it("shows the key of today's check-in and opens today's practice", async () => {
    await renderWithProviders(<HomeScreen />)
    await waitFor(() => expect(screen.getByText('Voz e Limites')).toBeTruthy())
    expect(screen.getByText('SUA CHAVE DE HOJE')).toBeTruthy()
    expect(screen.getByText(ANXIOUS_CHECK_IN.dailyKey.text)).toBeTruthy()

    await fireEvent.press(screen.getByText('Ver prática de hoje'))
    expect(push).toHaveBeenCalledWith({
      pathname: ROUTES.PRACTICE,
      params: { practiceId: 'guided-breathing' },
    })
    expect(toast).not.toHaveBeenCalled()
  })

  it('invites to the check-in when there is none today', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => null))
    await renderWithProviders(<HomeScreen />)
    await waitFor(() => expect(screen.getByText('Como você está hoje?')).toBeTruthy())
    expect(screen.getByText('Faça seu check-in para receber a chave do dia.')).toBeTruthy()
    expect(screen.queryByText('Voz e Limites')).toBeNull()

    await fireEvent.press(screen.getByText('Fazer check-in'))
    expect(push).toHaveBeenCalledWith(ROUTES.CHECK_IN)
  })

  it('shows a skeleton, never a spinner, while the key loads', async () => {
    await renderWithProviders(<HomeScreen />)
    // One skeleton per card: the key, the verse and the plan.
    expect(screen.getAllByLabelText('Carregando')).toHaveLength(3)
    expect(JSON.stringify(screen.toJSON())).not.toContain('"ActivityIndicator"')
    await waitFor(() => expect(screen.queryByLabelText('Carregando')).toBeNull())
    expect(screen.getByText('Voz e Limites')).toBeTruthy()
    expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy()
  })

  it('shows the error in place of the card and retries', async () => {
    server.use(mockTrpcError('checkIn.latestForDate', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<HomeScreen />)
    await waitFor(() => expect(screen.getByText('Tentar de novo')).toBeTruthy())
    expect(screen.getByText('Bom dia, Ana')).toBeTruthy()

    server.use(mockQuery('checkIn.latestForDate', () => ANXIOUS_CHECK_IN))
    await fireEvent.press(screen.getByText('Tentar de novo'))
    await waitFor(() => expect(screen.getByText('Voz e Limites')).toBeTruthy())
  })

  it('keeps the retry busy and blocked while the refetch runs', async () => {
    const { queryClient } = await renderWithProviders(<HomeScreen />)
    await screen.findByText('Voz e Limites')

    // A later refetch fails: the old key is kept in the cache, so the error state keeps its button on screen.
    server.use(mockTrpcError('checkIn.latestForDate', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await act(async () => {
      await queryClient.refetchQueries()
    })
    const retry = await screen.findByTestId(TEST_IDS.ERROR_STATE_RETRY)
    expect(retry.props.accessibilityState).toEqual(expect.objectContaining({ busy: false }))

    let release = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/checkIn.latestForDate`, async () => {
        await gate
        return HttpResponse.json({ result: { data: ANXIOUS_CHECK_IN } })
      }),
    )
    await fireEvent.press(retry)

    await waitFor(() =>
      expect(screen.getByTestId(TEST_IDS.ERROR_STATE_RETRY).props.accessibilityState).toEqual(
        expect.objectContaining({ busy: true, disabled: true }),
      ),
    )
    await act(async () => release())
    await screen.findByText('Voz e Limites')
  })

  it('shows the initial of the first name when there is no photo', async () => {
    await renderHomeLoaded()
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.USER_AVATAR_IMAGE)).toBeNull()
  })

  it('shows the photo when the user has one', async () => {
    mockUser({ hasImage: true })
    await renderHomeLoaded()
    const image = screen.getByTestId(TEST_IDS.USER_AVATAR_IMAGE)
    expect(image.props.source).toEqual({ uri: 'https://img.test/ana.png' })
  })

  it('shows an empty avatar when there is neither photo nor name', async () => {
    mockUser({ firstName: null })
    await renderHomeLoaded()
    expect(screen.queryByTestId(TEST_IDS.USER_AVATAR_INITIAL)).toBeNull()
    expect(screen.getByRole('button', { name: 'Perfil' })).toBeTruthy()
  })

  it('points the bell to the coming soon notice and the avatar to the profile', async () => {
    await renderHomeLoaded()
    await fireEvent.press(screen.getByRole('button', { name: 'Notificações' }))
    expect(toast).toHaveBeenCalledTimes(1)
    await fireEvent.press(screen.getByRole('button', { name: 'Perfil' }))
    expect(push).toHaveBeenCalledWith(ROUTES.PROFILE)
    expect(toast).toHaveBeenCalledTimes(1)
  })

  it('shows the verse with its reference and translation, and its play button says coming soon', async () => {
    await renderHomeLoaded()
    expect(screen.getByText('Um minuto com Deus')).toBeTruthy()
    expect(screen.getByText(`“${VERSE.text}”`)).toBeTruthy()
    expect(screen.getByText('Jeremias 29:11 (NVI)')).toBeTruthy()

    await fireEvent.press(screen.getByRole('button', { name: 'Ouvir o versículo' }))
    expect(toast).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
  })

  it('asks for the verse of the device local date', async () => {
    const requested = jest.fn()
    server.use(
      mockQuery('verse.ofDay', (input) => {
        requested(input)
        return VERSE
      }),
    )
    await renderHomeLoaded()
    expect(requested).toHaveBeenCalledWith({ localDate: '2026-10-19' })
  })

  it('shows the plan in progress with its next day and progress, and opens the plan', async () => {
    await renderHomeLoaded()
    expect(screen.getByText('Continue sua jornada')).toBeTruthy()
    expect(screen.getByText('Dia 2 de 3')).toBeTruthy()
    const bar = screen.getByRole('progressbar', { name: 'Progresso do plano' })
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 33 })
    expect(screen.getByTestId(TEST_IDS.PROGRESS_BAR_FILL)).toHaveStyle({
      width: `${(1 / 3) * 100}%`,
    })

    await fireEvent.press(screen.getByTestId(TEST_IDS.HOME_CURRENT_PLAN))
    expect(push).toHaveBeenCalledWith({
      pathname: ROUTES.PLAN,
      params: { planId: 'when-discouragement-weighs' },
    })
  })

  it('invites to pick a plan when none is in progress and opens the plans', async () => {
    server.use(mockQuery('plan.current', () => null))
    await renderWithProviders(<HomeScreen />)
    await screen.findByText('Escolha um plano para começar.')
    expect(screen.getByText('Continue sua jornada')).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.PROGRESS_BAR)).toBeNull()
    await screen.findByText('Voz e Limites')

    await fireEvent.press(screen.getByTestId(TEST_IDS.HOME_CURRENT_PLAN))
    expect(push).toHaveBeenCalledWith(ROUTES.PLANS)
  })

  it('shows the error of the verse card alone and retries it', async () => {
    server.use(mockTrpcError('verse.ofDay', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<HomeScreen />)
    await screen.findByText('Tentar de novo')
    expect(screen.getAllByText('Tentar de novo')).toHaveLength(1)
    await screen.findByText('Voz e Limites')
    expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy()

    server.use(mockQuery('verse.ofDay', () => VERSE))
    await fireEvent.press(screen.getByText('Tentar de novo'))
    await screen.findByText('Jeremias 29:11 (NVI)')
  })

  it('shows the error of the plan card alone and retries it', async () => {
    server.use(mockTrpcError('plan.current', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<HomeScreen />)
    await screen.findByText('Tentar de novo')
    expect(screen.getAllByText('Tentar de novo')).toHaveLength(1)
    await screen.findByText('Voz e Limites')
    await screen.findByText('Jeremias 29:11 (NVI)')

    server.use(mockQuery('plan.current', () => CURRENT_PLAN))
    await fireEvent.press(screen.getByText('Tentar de novo'))
    await screen.findByText('Dia 2 de 3')
  })
})

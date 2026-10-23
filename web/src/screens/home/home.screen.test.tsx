import { TEST_IDS, TRPC_ERROR_CODES } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { clerkMock } from '../../../tests/utils/clerk-mock'
import { renderWithProviders } from '../../../tests/utils/render'
import { setViewportWidth } from '../../../tests/utils/viewport'
import { ROUTES } from '../../constants/route.constant'
import { HomeScreen } from './home.screen'

vi.mock('sonner', () => ({ toast: vi.fn() }))

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

function mockUser(user: Partial<{ firstName: string | null; hasImage: boolean }> = {}) {
  clerkMock.user = {
    firstName: 'Ana',
    hasImage: false,
    imageUrl: 'https://img.test/ana.png',
    ...user,
  }
}

// Only the Date clock is frozen; timers and microtasks keep running for real.
function freezeDateAt(year: number, month: number, day: number, hours: number) {
  vi.useFakeTimers({ now: new Date(year, month, day, hours, 0), toFake: ['Date'] })
}

// Renders and waits for the three cards, so no request is still in flight when the handlers are reset.
async function renderHomeLoaded() {
  const rendered = await renderWithProviders(<HomeScreen />, { route: ROUTES.HOME })
  await screen.findByText('Voz e Limites')
  await screen.findByText('Quando o desânimo pesar')
  await screen.findByText(/Jeremias 29:11/)
  return rendered
}

describe('HomeScreen', () => {
  beforeEach(() => {
    vi.mocked(toast).mockClear()
    mockUser()
    freezeDateAt(2026, 9, 19, 9)
    server.use(
      mockQuery('checkIn.latestForDate', () => ANXIOUS_CHECK_IN),
      mockQuery('verse.ofDay', () => VERSE),
      mockQuery('plan.current', () => CURRENT_PLAN),
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('greets by name in the morning with the subtitle', async () => {
    await renderHomeLoaded()

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Bom dia, Ana')
    expect(screen.getByText('Que bom ter você aqui hoje.')).toBeTruthy()
  })

  it.each([
    [14, 'Boa tarde, Ana'],
    [20, 'Boa noite, Ana'],
  ])('greets at %i:00 with %s', async (hours, expected) => {
    freezeDateAt(2026, 9, 19, hours)
    await renderHomeLoaded()

    expect(screen.getByTestId(TEST_IDS.HOME_GREETING).textContent).toBe(expected)
  })

  it('drops the comma when there is no first name or no user yet', async () => {
    mockUser({ firstName: null })
    const { unmount } = await renderHomeLoaded()
    expect(screen.getByTestId(TEST_IDS.HOME_GREETING).textContent).toBe('Bom dia')
    unmount()

    clerkMock.user = null
    await renderHomeLoaded()
    expect(screen.getByTestId(TEST_IDS.HOME_GREETING).textContent).toBe('Bom dia')
  })

  it("shows the key of today's check-in and opens today's practice", async () => {
    const { router } = await renderHomeLoaded()

    expect(screen.getByText('SUA CHAVE DE HOJE')).toBeTruthy()
    expect(screen.getByText(ANXIOUS_CHECK_IN.dailyKey.text)).toBeTruthy()

    fireEvent.click(screen.getByText('Ver prática de hoje'))

    await waitFor(() => expect(router.state.location.pathname).toBe('/practice/guided-breathing'))
    expect(toast).not.toHaveBeenCalled()
  })

  it('invites to the check-in when there is none today', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => null))
    const { router } = await renderWithProviders(<HomeScreen />, { route: ROUTES.HOME })
    await screen.findByText('Como você está hoje?')
    expect(screen.getByText('Faça seu check-in para receber a chave do dia.')).toBeTruthy()
    expect(screen.queryByText('Voz e Limites')).toBeNull()

    fireEvent.click(screen.getByText('Fazer check-in'))

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.CHECK_IN))
  })

  it('shows one skeleton per card, never a spinner, while they load', async () => {
    await renderWithProviders(<HomeScreen />, { route: ROUTES.HOME })

    expect(screen.getAllByRole('progressbar', { name: 'Carregando' })).toHaveLength(3)
    expect(screen.queryByRole('status')).toBeNull()
    await waitFor(() =>
      expect(screen.queryByRole('progressbar', { name: 'Carregando' })).toBeNull(),
    )
    expect(screen.getByText('Voz e Limites')).toBeTruthy()
    expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy()
  })

  it('shows the error in place of the key card and retries', async () => {
    server.use(mockTrpcError('checkIn.latestForDate', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<HomeScreen />, { route: ROUTES.HOME })
    await screen.findByText('Tentar de novo')
    expect(screen.getByTestId(TEST_IDS.HOME_GREETING).textContent).toBe('Bom dia, Ana')

    server.use(mockQuery('checkIn.latestForDate', () => ANXIOUS_CHECK_IN))
    fireEvent.click(screen.getByText('Tentar de novo'))

    await screen.findByText('Voz e Limites')
  })

  it('keeps the retry busy and blocked while the refetch runs', async () => {
    const { queryClient } = await renderHomeLoaded()

    // A later refetch fails: the old key stays in the cache, so the error state keeps its button on screen.
    server.use(mockTrpcError('checkIn.latestForDate', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await act(async () => {
      await queryClient.refetchQueries()
    })
    const retry = await screen.findByTestId(TEST_IDS.ERROR_STATE_RETRY)
    expect(retry.getAttribute('aria-busy')).toBe('false')

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
    fireEvent.click(retry)

    await waitFor(() => {
      const busy = screen.getByTestId(TEST_IDS.ERROR_STATE_RETRY)
      expect(busy.getAttribute('aria-busy')).toBe('true')
      expect((busy as HTMLButtonElement).disabled).toBe(true)
    })
    await act(async () => release())
    await screen.findByText('Voz e Limites')
  })

  it('points the bell to the coming soon notice', async () => {
    await renderHomeLoaded()

    fireEvent.click(screen.getByRole('button', { name: 'Notificações' }))

    expect(toast).toHaveBeenCalledWith('Em breve')
    expect(screen.queryByRole('link', { name: 'Perfil' })).toBeNull()
  })

  it('shows the verse with its reference and translation, and its play button says coming soon', async () => {
    const { router } = await renderHomeLoaded()
    expect(screen.getByText('Um minuto com Deus')).toBeTruthy()
    expect(screen.getByText(`“${VERSE.text}”`)).toBeTruthy()
    expect(screen.getByText('Jeremias 29:11 (NVI)')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Ouvir o versículo' }))

    expect(toast).toHaveBeenCalledTimes(1)
    expect(router.state.location.pathname).toBe(ROUTES.HOME)
  })

  it('asks for the verse of the device local date', async () => {
    const requested = vi.fn()
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
    const { router } = await renderHomeLoaded()
    expect(screen.getByText('Continue sua jornada')).toBeTruthy()
    expect(screen.getByText('Dia 2 de 3')).toBeTruthy()
    expect(
      screen.getByRole('progressbar', { name: 'Progresso do plano' }).getAttribute('aria-valuenow'),
    ).toBe('33')
    expect(screen.getByTestId(TEST_IDS.PROGRESS_BAR_FILL).style.width).toBe(`${(1 / 3) * 100}%`)

    fireEvent.click(screen.getByTestId(TEST_IDS.HOME_CURRENT_PLAN))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/plan/when-discouragement-weighs'),
    )
  })

  it('invites to pick a plan when none is in progress and opens the plans', async () => {
    server.use(mockQuery('plan.current', () => null))
    const { router } = await renderWithProviders(<HomeScreen />, { route: ROUTES.HOME })
    await screen.findByText('Escolha um plano para começar.')
    await screen.findByText('Voz e Limites')
    expect(screen.getByText('Continue sua jornada')).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.PROGRESS_BAR)).toBeNull()

    fireEvent.click(screen.getByTestId(TEST_IDS.HOME_CURRENT_PLAN))

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.PLANS))
  })

  it('shows the error of the verse card alone and retries it', async () => {
    server.use(mockTrpcError('verse.ofDay', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<HomeScreen />, { route: ROUTES.HOME })
    await screen.findByText('Tentar de novo')
    await screen.findByText('Voz e Limites')
    expect(screen.getAllByText('Tentar de novo')).toHaveLength(1)
    expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy()

    server.use(mockQuery('verse.ofDay', () => VERSE))
    fireEvent.click(screen.getByText('Tentar de novo'))

    await screen.findByText('Jeremias 29:11 (NVI)')
  })

  it('shows the error of the plan card alone and retries it', async () => {
    server.use(mockTrpcError('plan.current', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<HomeScreen />, { route: ROUTES.HOME })
    await screen.findByText('Tentar de novo')
    await screen.findByText('Voz e Limites')
    await screen.findByText('Jeremias 29:11 (NVI)')
    expect(screen.getAllByText('Tentar de novo')).toHaveLength(1)

    server.use(mockQuery('plan.current', () => CURRENT_PLAN))
    fireEvent.click(screen.getByText('Tentar de novo'))

    await screen.findByText('Dia 2 de 3')
  })

  describe('on a wide screen', () => {
    it('leaves the brand and the avatar to the side navigation and puts the bell by the greeting', async () => {
      await renderHomeLoaded()

      expect(screen.queryByText('CLAVIS VIA')).toBeNull()
      expect(screen.queryByTestId(TEST_IDS.USER_AVATAR)).toBeNull()
      expect(screen.getByRole('button', { name: 'Notificações' })).toBeTruthy()
    })
  })

  describe('on a phone', () => {
    beforeEach(() => setViewportWidth(390))

    it('shows the brand, the bell and the avatar in the top header', async () => {
      await renderHomeLoaded()

      expect(screen.getByText('CLAVIS VIA')).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Notificações' })).toBeTruthy()
      expect(screen.getByText('A')).toBeTruthy()
    })

    it('opens the profile from the avatar', async () => {
      const { router } = await renderHomeLoaded()

      fireEvent.click(screen.getByRole('link', { name: 'Perfil' }))

      await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.PROFILE))
    })

    it('shows the photo when the user has one', async () => {
      mockUser({ hasImage: true })
      await renderHomeLoaded()

      expect(screen.getByTestId(TEST_IDS.USER_AVATAR_IMAGE).getAttribute('src')).toBe(
        'https://img.test/ana.png',
      )
    })

    it('shows an empty avatar when there is neither photo nor name', async () => {
      mockUser({ firstName: null })
      await renderHomeLoaded()

      expect(screen.queryByTestId(TEST_IDS.USER_AVATAR_INITIAL)).toBeNull()
      expect(screen.getByRole('link', { name: 'Perfil' })).toBeTruthy()
    })
  })
})

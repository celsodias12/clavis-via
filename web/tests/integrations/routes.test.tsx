import { TEST_IDS } from '@clavis-via/shared'
import { mockQuery, server } from '@clavis-via/shared/testing'
import { createMemoryHistory } from '@tanstack/react-router'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vite-plus/test'
import { createAppRouter } from '../../src/configs/router.config'
import { ROUTES } from '../../src/constants/route.constant'
import { clerkMock } from '../utils/clerk-mock'
import { renderApp } from '../utils/render'

const TODAY_CHECK_IN = {
  id: 'check-in-1',
  state: 'anxious',
  otherText: null,
  localDate: '2026-10-19',
  createdAt: '2026-10-19T12:00:00.000Z',
  dailyKey: {
    title: 'Voz e Limites',
    text: 'Texto da chave.',
    practice: {
      id: 'guided-breathing',
      title: 'Respiração guiada',
      durationSeconds: 180,
      description: 'x',
    },
  },
}

function signIn() {
  clerkMock.state = { isLoaded: true, isSignedIn: true, userId: 'user-1' }
}

describe('route guards', () => {
  // The welcome screen is a lazy chunk: loading it once up front keeps the first test off the cold path.
  beforeAll(async () => {
    await createAppRouter(createMemoryHistory({ initialEntries: [ROUTES.HOME] })).preloadRoute({
      to: ROUTES.WELCOME,
    })
  })

  it('sends a signed out visitor from a private route to the entry route', async () => {
    const { router } = await renderApp({ route: '/emotions' })

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.WELCOME))
    expect(await screen.findByTestId(TEST_IDS.WELCOME_START)).toBeTruthy()
  })

  it('sends a signed in user from a public route to /start', async () => {
    signIn()
    server.use(mockQuery('checkIn.latestForDate', () => TODAY_CHECK_IN))

    const { router } = await renderApp({ route: '/' })

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
  })

  it('shows the key and does not redirect while Clerk has not loaded', async () => {
    clerkMock.state = { isLoaded: false, isSignedIn: false }

    const { router } = await renderApp({ route: '/emotions' })

    expect(screen.getByTestId(TEST_IDS.BRAND_KEY)).toBeTruthy()
    expect(router.state.location.pathname).toBe('/emotions')

    clerkMock.state = { isLoaded: false, isSignedIn: false }
    await act(async () => router.navigate({ to: ROUTES.SIGN_IN }))
    expect(router.state.location.pathname).toBe(ROUTES.SIGN_IN)
    expect(screen.getByTestId(TEST_IDS.BRAND_KEY)).toBeTruthy()
  })

  it('goes on to the screen once Clerk has loaded', async () => {
    clerkMock.state = { isLoaded: false, isSignedIn: false }
    const { router } = await renderApp({ route: '/sign-in' })

    act(() => clerkMock.setState({ isLoaded: true, isSignedIn: false }))

    await waitFor(() => expect(screen.getByTestId(TEST_IDS.AUTHENTICATION_SUBMIT)).toBeTruthy())
    expect(router.state.location.pathname).toBe(ROUTES.SIGN_IN)
  })
})

describe('route tree', () => {
  it('leaves the focus alone through the startup redirects and moves it on a later user navigation', async () => {
    signIn()
    server.use(mockQuery('checkIn.latestForDate', () => TODAY_CHECK_IN))

    // Cold start: no preloading, so the chain / to /start to /home runs on its own.
    const { router } = await renderApp({ route: ROUTES.WELCOME })
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
    await screen.findByTestId(TEST_IDS.HOME_GREETING)
    expect(document.activeElement).toBe(document.body)

    fireEvent.keyDown(document.body, { key: 'Tab' })
    await act(async () => router.navigate({ to: ROUTES.PROFILE }))

    const heading = await screen.findByRole('heading', { level: 1 })
    await waitFor(() => expect(document.activeElement).toBe(heading))
  })

  it('renders the not found screen for a path that does not exist', async () => {
    await renderApp({ route: '/nowhere' })

    expect(screen.getByTestId(TEST_IDS.NOT_FOUND)).toBeTruthy()
  })

  it('opens Meu perfil for a signed in user', async () => {
    signIn()

    const { router } = await renderApp({ route: ROUTES.PROFILE })

    expect(screen.getByTestId(TEST_IDS.PROFILE_SCREEN)).toBeTruthy()
    expect(router.state.location.pathname).toBe(ROUTES.PROFILE)
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('opens Minha jornada for a signed in user', async () => {
    signIn()
    server.use(mockQuery('journey.overview', () => ({ streakDays: 0, week: [], achievements: [] })))

    const { router } = await renderApp({ route: ROUTES.JOURNEY })

    expect(await screen.findByTestId(TEST_IDS.JOURNEY_STREAK)).toBeTruthy()
    expect(router.state.location.pathname).toBe(ROUTES.JOURNEY)
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('opens Minhas emoções for a signed in user', async () => {
    signIn()
    server.use(
      mockQuery('emotion.summary', () => ({
        period: 'week',
        points: [],
        hasCheckIns: false,
        insights: [],
      })),
    )

    const { router } = await renderApp({ route: ROUTES.EMOTIONS })

    expect(await screen.findByTestId(TEST_IDS.EMOTIONS_EMPTY)).toBeTruthy()
    expect(router.state.location.pathname).toBe(ROUTES.EMOTIONS)
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('opens Conversa for a signed in user', async () => {
    signIn()
    server.use(mockQuery('conversation.list', () => []))

    const { router } = await renderApp({ route: ROUTES.CONVERSATION })

    expect(await screen.findByTestId(TEST_IDS.CONVERSATION_SCREEN)).toBeTruthy()
    expect(router.state.location.pathname).toBe(ROUTES.CONVERSATION)
    await screen.findByText('Quero conversar')
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('opens Início for a signed in user', async () => {
    signIn()
    server.use(
      mockQuery('checkIn.latestForDate', () => TODAY_CHECK_IN),
      mockQuery('verse.ofDay', () => ({ text: 'Texto', reference: 'Salmos 23:1' })),
      mockQuery('plan.current', () => null),
    )

    const { router } = await renderApp({ route: ROUTES.HOME })

    expect(await screen.findByTestId(TEST_IDS.HOME_GREETING)).toBeTruthy()
    expect(router.state.location.pathname).toBe(ROUTES.HOME)
    await screen.findByText('Voz e Limites')
    await screen.findByText('Escolha um plano para começar.')
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('opens Planos for a signed in user', async () => {
    signIn()
    server.use(
      mockQuery('plan.list', () => [
        {
          id: 'after-a-rejection',
          title: 'Depois de uma rejeição',
          category: 'emotions',
          totalDays: 7,
        },
      ]),
    )

    const { router } = await renderApp({ route: ROUTES.PLANS })

    expect(await screen.findByText('Depois de uma rejeição')).toBeTruthy()
    expect(router.state.location.pathname).toBe(ROUTES.PLANS)
  })

  it('opens the check-in for a signed in user', async () => {
    signIn()

    const { router } = await renderApp({ route: ROUTES.CHECK_IN })

    expect(screen.getByTestId(TEST_IDS.CHECK_IN_SUBMIT)).toBeTruthy()
    expect(router.state.location.pathname).toBe(ROUTES.CHECK_IN)
  })

  it('opens the dynamic routes with their params', async () => {
    signIn()
    server.use(
      mockQuery('plan.detail', () => ({
        id: 'plan-1',
        title: 'Plano de teste',
        category: 'faith',
        totalDays: 1,
        description: 'Descrição',
        isEnrolled: false,
        completedDayNumbers: [],
        days: [{ dayNumber: 1, title: 'Primeiro dia', summary: 'Resumo' }],
        reflections: [],
      })),
    )
    const { router } = await renderApp({ route: '/plan/plan-1' })
    expect(router.state.matches.at(-1)?.params).toEqual({ planId: 'plan-1' })
    expect(await screen.findByText('Plano de teste')).toBeTruthy()

    server.use(
      mockQuery('plan.day', () => ({
        planId: 'plan-1',
        planTitle: 'Plano de teste',
        totalDays: 3,
        dayNumber: 2,
        title: 'Segundo dia',
        videoDurationSeconds: 60,
        message: 'Mensagem.',
        reflection: 'Reflexão.',
        action: 'Ação do segundo dia.',
        tip: 'Dica.',
        prayer: 'Oração.',
        completion: null,
      })),
    )
    await act(async () =>
      router.navigate({ to: ROUTES.PLAN_DAY, params: { planId: 'plan-1', dayNumber: '2' } }),
    )
    expect(router.state.location.pathname).toBe('/plan/plan-1/day/2')
    expect(await screen.findByText('Segundo dia')).toBeTruthy()
    expect(screen.getByText('Dia 2 de 3')).toBeTruthy()

    await act(async () =>
      router.navigate({
        to: ROUTES.PLAN_DAY_ACTION,
        params: { planId: 'plan-1', dayNumber: '2' },
      }),
    )
    expect(router.state.location.pathname).toBe('/plan/plan-1/day/2/action')
    expect(await screen.findByText('Ação do segundo dia.')).toBeTruthy()

    server.use(
      mockQuery('practice.byId', () => ({
        id: 'guided-breathing',
        title: 'Respiração guiada',
        durationSeconds: 180,
        description: 'Uma pausa.',
      })),
    )
    await act(async () =>
      router.navigate({ to: ROUTES.PRACTICE, params: { practiceId: 'guided-breathing' } }),
    )
    expect(router.state.location.pathname).toBe('/practice/guided-breathing')
    expect(await screen.findByTestId(TEST_IDS.PRACTICE_SCREEN)).toBeTruthy()
    expect(await screen.findByText('Respiração guiada')).toBeTruthy()

    await act(async () => router.navigate({ to: ROUTES.PLAN, params: { planId: 'plan-2' } }))
    expect(router.state.location.pathname).toBe('/plan/plan-2')
  })
})

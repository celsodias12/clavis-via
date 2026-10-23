import { TEST_IDS, TRPC_ERROR_CODES, toLocalDate } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { JourneyScreen } from './journey.screen'

vi.mock('sonner', () => ({ toast: vi.fn() }))

const DAYS_IN_WEEK = 7

function currentWeek(checkedDays: number) {
  const today = new Date()
  const sinceMonday = (today.getDay() + DAYS_IN_WEEK - 1) % DAYS_IN_WEEK
  return Array.from({ length: DAYS_IN_WEEK }, (_, offset) => ({
    localDate: toLocalDate(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - sinceMonday + offset),
    ),
    hasCheckIn: offset < checkedDays,
  }))
}

function overview(streakDays: number, checkedDays: number, achievements: unknown[]) {
  return { streakDays, week: currentWeek(checkedDays), achievements }
}

const FULL_ACHIEVEMENTS = [
  { kind: 'weekly-check-ins', count: 5 },
  { kind: 'plan-progress', planTitle: 'Quando o desânimo pesar', completedDays: 1, totalDays: 3 },
  { kind: 'completed-plans', count: 2 },
  { kind: 'completed-practices', count: 1 },
  { kind: 'completed-actions', count: 3 },
]

const scrollIntoView = vi.fn()

beforeEach(() => {
  vi.mocked(toast).mockClear()
  scrollIntoView.mockClear()
  vi.mocked(window.scrollTo).mockClear()
  Element.prototype.scrollIntoView = scrollIntoView
})

describe('JourneyScreen', () => {
  it('shows skeletons, never a spinner, while the overview loads', async () => {
    let release = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/journey.overview`, async () => {
        await gate
        return HttpResponse.json({ result: { data: overview(1, 1, []) } })
      }),
    )
    await renderWithProviders(<JourneyScreen />, { route: ROUTES.JOURNEY })

    expect(screen.getByRole('heading', { name: 'Minha jornada' })).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.JOURNEY_SKELETON)).toBeTruthy()
    expect(screen.getAllByLabelText('Carregando').length).toBeGreaterThan(0)
    expect(screen.queryByTestId(TEST_IDS.JOURNEY_STREAK)).toBeNull()

    await act(async () => release())
    await screen.findByTestId(TEST_IDS.JOURNEY_STREAK)
    expect(screen.queryByTestId(TEST_IDS.JOURNEY_SKELETON)).toBeNull()
  })

  it('shows the streak, the week dots and the phrase', async () => {
    server.use(mockQuery('journey.overview', () => overview(8, 5, [])))
    await renderWithProviders(<JourneyScreen />, { route: ROUTES.JOURNEY })

    await waitFor(() =>
      expect(screen.getByTestId(TEST_IDS.JOURNEY_STREAK_NUMBER).textContent).toBe('8'),
    )
    expect(screen.getByText('dias consecutivos')).toBeTruthy()
    const week = currentWeek(5)
    const done = (localDate: string) =>
      screen.queryByTestId(
        `${TEST_IDS.JOURNEY_DAY_PREFIX}${localDate}${TEST_IDS.JOURNEY_DAY_DONE_SUFFIX}`,
      )
    expect(week.filter((day) => done(day.localDate) !== null)).toEqual(week.slice(0, 5))
    expect(
      screen.getByText('“Você não precisa ser perfeita para estar em progresso.”'),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Visão geral' })).toBeTruthy()
    // The segment and the heading of the list share the label.
    expect(screen.getAllByText('Minhas conquistas')).toHaveLength(2)
  })

  it('uses the singular for one day', async () => {
    server.use(mockQuery('journey.overview', () => overview(1, 1, [])))
    await renderWithProviders(<JourneyScreen />, { route: ROUTES.JOURNEY })

    await waitFor(() => expect(screen.getByText('dia consecutivo')).toBeTruthy())
  })

  it('lists the achievements in order', async () => {
    server.use(mockQuery('journey.overview', () => overview(3, 3, FULL_ACHIEVEMENTS)))
    await renderWithProviders(<JourneyScreen />, { route: ROUTES.JOURNEY })

    await waitFor(() => expect(screen.getByText('Fiz 5 check-ins esta semana')).toBeTruthy())
    expect(screen.getByText('Quando o desânimo pesar: 1 de 3 dias')).toBeTruthy()
    expect(screen.getByText('Concluí 2 planos')).toBeTruthy()
    expect(screen.getByText('Fiz 1 prática')).toBeTruthy()
    expect(screen.getByText('Concluí 3 ações do dia')).toBeTruthy()
  })

  it('shows a welcoming message when there are no achievements', async () => {
    server.use(mockQuery('journey.overview', () => overview(0, 0, [])))
    await renderWithProviders(<JourneyScreen />, { route: ROUTES.JOURNEY })

    await waitFor(() =>
      expect(
        screen.getByText('Suas conquistas aparecem aqui conforme você usa o app.'),
      ).toBeTruthy(),
    )
  })

  it('opens Minhas emoções from its segment', async () => {
    server.use(mockQuery('journey.overview', () => overview(1, 1, [])))
    const { router } = await renderWithProviders(<JourneyScreen />, { route: ROUTES.JOURNEY })

    fireEvent.click(screen.getByTestId(`${TEST_IDS.JOURNEY_SEGMENT_PREFIX}emotions`))

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.EMOTIONS))
  })

  it('scrolls to the achievements and back to the top', async () => {
    server.use(mockQuery('journey.overview', () => overview(1, 1, FULL_ACHIEVEMENTS)))
    await renderWithProviders(<JourneyScreen />, { route: ROUTES.JOURNEY })

    fireEvent.click(screen.getByTestId(`${TEST_IDS.JOURNEY_SEGMENT_PREFIX}achievements`))
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(
      screen
        .getByTestId(`${TEST_IDS.JOURNEY_SEGMENT_PREFIX}achievements`)
        .getAttribute('aria-pressed'),
    ).toBe('true')

    fireEvent.click(screen.getByTestId(`${TEST_IDS.JOURNEY_SEGMENT_PREFIX}overview`))
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' })
    expect(
      screen.getByTestId(`${TEST_IDS.JOURNEY_SEGMENT_PREFIX}overview`).getAttribute('aria-pressed'),
    ).toBe('true')
  })

  it('shows "Em breve" for the calendar, "Ver todas" and an achievement row', async () => {
    server.use(mockQuery('journey.overview', () => overview(1, 1, FULL_ACHIEVEMENTS)))
    await renderWithProviders(<JourneyScreen />, { route: ROUTES.JOURNEY })

    fireEvent.click(await screen.findByTestId(TEST_IDS.JOURNEY_CALENDAR))
    fireEvent.click(screen.getByTestId(TEST_IDS.JOURNEY_VIEW_ALL))
    fireEvent.click(screen.getByTestId(`${TEST_IDS.JOURNEY_ACHIEVEMENT_PREFIX}completed-plans`))

    expect(toast).toHaveBeenCalledTimes(3)
    expect(toast).toHaveBeenCalledWith('Em breve')
  })

  it('shows the error state, keeps the segments and retries', async () => {
    server.use(mockTrpcError('journey.overview', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<JourneyScreen />, { route: ROUTES.JOURNEY })

    await screen.findByText('Tentar de novo')
    // Without the list on the page the segment has nowhere to scroll to, and it must not fail.
    fireEvent.click(screen.getByTestId(`${TEST_IDS.JOURNEY_SEGMENT_PREFIX}achievements`))
    expect(scrollIntoView).not.toHaveBeenCalled()

    server.use(mockQuery('journey.overview', () => overview(4, 2, [])))
    fireEvent.click(screen.getByText('Tentar de novo'))

    await waitFor(() =>
      expect(screen.getByTestId(TEST_IDS.JOURNEY_STREAK_NUMBER).textContent).toBe('4'),
    )
  })
})

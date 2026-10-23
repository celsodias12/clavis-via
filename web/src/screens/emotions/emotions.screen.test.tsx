import { TEST_IDS, TRPC_ERROR_CODES, toLocalDate } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { EmotionsScreen } from './emotions.screen'

// The chart has its own test; here it only reports what it received.
vi.mock('../../components/emotion-chart/emotion-chart.component', () => ({
  EmotionChart: ({ points, period }: { points: unknown[]; period: string }): ReactNode => (
    <p data-testid="mock-emotion-chart">{`${period}:${points.length}`}</p>
  ),
}))

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const DAYS_IN_WEEK = 7
const DAYS_IN_MONTH_VIEW = 31

function dayKey(offsetFromToday: number) {
  const today = new Date()
  return toLocalDate(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + offsetFromToday),
  )
}

function currentWeek() {
  const sinceMonday = (new Date().getDay() + DAYS_IN_WEEK - 1) % DAYS_IN_WEEK
  return Array.from({ length: DAYS_IN_WEEK }, (_, offset) => dayKey(offset - sinceMonday))
}

function weekSummary(todayState: string | null, insights: unknown[] = []) {
  const today = toLocalDate(new Date())
  return {
    period: 'week',
    points: currentWeek().map((key) => ({
      key,
      score: key === today && todayState === 'anxious' ? 2 : null,
      state: key === today ? todayState : null,
    })),
    hasCheckIns: todayState !== null,
    insights,
  }
}

function monthSummary() {
  const now = new Date()
  const keys = Array.from({ length: DAYS_IN_MONTH_VIEW }, (_, offset) =>
    toLocalDate(new Date(now.getFullYear(), now.getMonth(), offset + 1)),
  )
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return {
    period: 'month',
    points: keys
      .slice(0, lastDay)
      .map((key) => ({ key, score: null, state: key === keys[0] ? 'at-peace' : null })),
    hasCheckIns: true,
    insights: [{ kind: 'balanced-days' }],
  }
}

function yearSummary() {
  const year = new Date().getFullYear()
  return {
    period: 'year',
    points: Array.from({ length: 12 }, (_, offset) => ({
      key: `${year}-${String(offset + 1).padStart(2, '0')}`,
      score: offset === 0 ? 4 : null,
      state: null,
    })),
    hasCheckIns: true,
    insights: [{ kind: 'less-anxiety', percent: 30 }],
  }
}

function renderScreen() {
  return renderWithProviders(<EmotionsScreen />, { route: ROUTES.EMOTIONS })
}

describe('EmotionsScreen', () => {
  it('shows placeholders, never a spinner, while the summary loads', async () => {
    let release = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/emotion.summary`, async () => {
        await gate
        return HttpResponse.json({ result: { data: weekSummary('anxious') } })
      }),
    )
    await renderScreen()

    expect(screen.getByRole('heading', { name: 'Minhas emoções' })).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.EMOTIONS_SKELETON)).toBeTruthy()
    expect(screen.getAllByLabelText('Carregando').length).toBeGreaterThan(0)

    await act(async () => release())
    await screen.findByTestId('mock-emotion-chart')
    expect(screen.queryByTestId(TEST_IDS.EMOTIONS_SKELETON)).toBeNull()
  })

  it('shows the emoji of the day of a check-in in the week view', async () => {
    const received: unknown[] = []
    server.use(
      mockQuery('emotion.summary', (input) => {
        received.push(input)
        return weekSummary('anxious')
      }),
    )
    await renderScreen()

    const today = toLocalDate(new Date())
    const column = await screen.findByTestId(`${TEST_IDS.EMOTIONS_DAY_PREFIX}${today}`)
    const todayLabel = WEEKDAYS[currentWeek().indexOf(today)]
    expect(column.getAttribute('aria-label')).toBe(`${todayLabel}: Ansiosa`)
    expect(within(column).getByTestId(TEST_IDS.EMOTION_ICON)).toBeTruthy()
    expect(received).toEqual([{ period: 'week', localDate: today }])
    for (const [index, key] of currentWeek().entries()) {
      expect(screen.getByText(WEEKDAYS[index])).toBeTruthy()
      if (key !== today) {
        const other = screen.getByTestId(`${TEST_IDS.EMOTIONS_DAY_PREFIX}${key}`)
        expect(other.getAttribute('aria-label')).toBe(`${WEEKDAYS[index]}: sem check-in`)
        expect(within(other).queryByTestId(TEST_IDS.EMOTION_ICON)).toBeNull()
      }
    }
    expect((await screen.findByTestId('mock-emotion-chart')).textContent).toBe('week:7')
  })

  it('shows the month view with the labels of the days 1, 8, 15, 22 and 29', async () => {
    const periods: unknown[] = []
    server.use(
      mockQuery('emotion.summary', (input) => {
        const { period } = input as { period: string }
        periods.push(period)
        return period === 'month' ? monthSummary() : weekSummary('anxious')
      }),
    )
    await renderScreen()
    await screen.findByTestId('mock-emotion-chart')

    fireEvent.click(screen.getByTestId(`${TEST_IDS.EMOTIONS_SEGMENT_PREFIX}month`))

    for (const day of ['1', '8', '15', '22']) {
      expect(await screen.findByText(day)).toBeTruthy()
    }
    expect(screen.queryByTestId(TEST_IDS.EMOTION_ICON)).toBeNull()
    expect(periods).toContain('month')
    expect(screen.getByText('Você registrou mais dias em paz este mês.')).toBeTruthy()
  })

  it('shows the initials of the months in the year view', async () => {
    const periods: unknown[] = []
    server.use(
      mockQuery('emotion.summary', (input) => {
        const { period } = input as { period: string }
        periods.push(period)
        return period === 'year' ? yearSummary() : weekSummary('anxious')
      }),
    )
    await renderScreen()
    await screen.findByTestId('mock-emotion-chart')

    fireEvent.click(screen.getByTestId(`${TEST_IDS.EMOTIONS_SEGMENT_PREFIX}year`))

    await waitFor(() => expect(screen.getAllByText('J')).toHaveLength(3))
    expect(screen.getAllByText('M')).toHaveLength(2)
    expect(screen.getByText('F')).toBeTruthy()
    expect(periods).toContain('year')
    expect(screen.getByText('Sua ansiedade diminuiu 30% em relação ao ano passado.')).toBeTruthy()
  })

  it('shows the insights with the texts of the design', async () => {
    server.use(
      mockQuery('emotion.summary', () =>
        weekSummary('anxious', [
          { kind: 'balanced-days' },
          { kind: 'less-anxiety', percent: 30 },
          { kind: 'routine-helps' },
        ]),
      ),
    )
    await renderScreen()

    expect(await screen.findByText('Principais percepções')).toBeTruthy()
    expect(screen.getByText('Mais dias em equilíbrio')).toBeTruthy()
    expect(screen.getByText('Você registrou mais dias em paz esta semana.')).toBeTruthy()
    expect(screen.getByText('Menos ansiedade')).toBeTruthy()
    expect(screen.getByText('Sua ansiedade diminuiu 30% em relação à semana passada.')).toBeTruthy()
    expect(screen.getByText('Rotina te ajuda')).toBeTruthy()
    expect(
      screen.getByText('Nos dias em que você fez a prática, seu humor esteve melhor.'),
    ).toBeTruthy()
  })

  it('invites the first check-in of an empty period', async () => {
    server.use(mockQuery('emotion.summary', () => weekSummary(null)))
    const { router } = await renderScreen()

    expect(await screen.findByText('Você ainda não fez check-in neste período.')).toBeTruthy()
    expect(screen.queryByText('Principais percepções')).toBeNull()

    fireEvent.click(screen.getByText('Fazer check-in'))

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.CHECK_IN))
  })

  it('shows the chart and the no-insight message when the period only holds "Outro" check-ins', async () => {
    server.use(
      mockQuery('emotion.summary', () => ({
        ...weekSummary(null),
        points: currentWeek().map((key) => ({ key, score: null, state: null })),
        hasCheckIns: true,
      })),
    )
    await renderScreen()

    expect(await screen.findByTestId('mock-emotion-chart')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.EMOTIONS_NO_INSIGHTS)).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.EMOTIONS_EMPTY)).toBeNull()
  })

  it('explains that the insights come with more check-ins when there are none yet', async () => {
    server.use(mockQuery('emotion.summary', () => weekSummary('anxious')))
    await renderScreen()

    expect(
      await screen.findByText('As percepções aparecem conforme você registra seus dias.'),
    ).toBeTruthy()
  })

  it('offers to try again when the summary fails', async () => {
    server.use(mockTrpcError('emotion.summary', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderScreen()
    expect(await screen.findByText('Tentar de novo')).toBeTruthy()

    server.use(mockQuery('emotion.summary', () => weekSummary('anxious')))
    fireEvent.click(screen.getByText('Tentar de novo'))

    await waitFor(() => expect(screen.getByTestId('mock-emotion-chart')).toBeTruthy())
  })

  it('keeps the centered app header on a phone', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    server.use(mockQuery('emotion.summary', () => weekSummary(null)))
    const { router } = await renderScreen()

    expect(screen.getByTestId(TEST_IDS.SCREEN_HEADER)).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Minhas emoções' })).toBeTruthy()
    fireEvent.click(screen.getByLabelText('Voltar'))

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.JOURNEY))
  })

  it('shows a back button above a left aligned title on a wide screen', async () => {
    server.use(mockQuery('emotion.summary', () => weekSummary(null)))
    await renderScreen()

    expect(screen.queryByTestId(TEST_IDS.SCREEN_HEADER)).toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'Minhas emoções' })).toBeTruthy()
  })

  it('goes back to Minha jornada from the header on a direct visit', async () => {
    server.use(mockQuery('emotion.summary', () => weekSummary(null)))
    const { router } = await renderScreen()

    fireEvent.click(screen.getByLabelText('Voltar'))

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.JOURNEY))
  })
})

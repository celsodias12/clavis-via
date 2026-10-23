import { TEST_IDS, TRPC_ERROR_CODES, toLocalDate } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react-native'
import { addDays, format, startOfWeek } from 'date-fns'
import { useRouter } from 'expo-router'
import { HttpResponse, http } from 'msw/http'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { EmotionsScreen } from './emotions.screen'

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))
jest.mock(
  'react-native-reanimated',
  () => require('../../../tests/utils/reanimated-mock').reanimatedModule,
)
// The chart draws on a native canvas; its own test covers the drawing, here it only reports what it received.
jest.mock('../../components/emotion-chart/emotion-chart.component', () => {
  const { Text } = require('react-native')
  return {
    EmotionChart: ({ points, period }: { points: unknown[]; period: string }) => (
      <Text testID="mock-emotion-chart">{`${period}:${points.length}`}</Text>
    ),
  }
})

// The emoji is decorative and hidden from accessibility on purpose; the column carries the label.
const HIDDEN = { includeHiddenElements: true }
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const WEEKDAY_FORMAT = 'yyyy-MM-dd'

function currentWeek() {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, offset) => format(addDays(monday, offset), WEEKDAY_FORMAT))
}

function weekSummary(
  todayState: string | null,
  insights: unknown[] = [],
): { period: string; points: unknown[]; hasCheckIns: boolean; insights: unknown[] } {
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
  const first = new Date()
  first.setDate(1)
  const keys = Array.from({ length: 31 }, (_, offset) =>
    format(addDays(first, offset), WEEKDAY_FORMAT),
  )
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
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

describe('EmotionsScreen', () => {
  const push = jest.fn()
  const back = jest.fn()

  beforeEach(() => {
    push.mockClear()
    back.mockClear()
    jest
      .mocked(useRouter)
      .mockReturnValue({ push, back } as unknown as ReturnType<typeof useRouter>)
  })

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
    await renderWithProviders(<EmotionsScreen />)
    expect(screen.getByText('Minhas emoções')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.EMOTIONS_SKELETON)).toBeTruthy()
    expect(screen.getAllByLabelText('Carregando').length).toBeGreaterThan(0)
    expect(JSON.stringify(screen.toJSON())).not.toContain('"ActivityIndicator"')

    await act(async () => release())
    await waitFor(() => expect(screen.getByTestId('mock-emotion-chart')).toBeTruthy())
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
    await renderWithProviders(<EmotionsScreen />)
    const today = toLocalDate(new Date())
    const column = await screen.findByTestId(`${TEST_IDS.EMOTIONS_DAY_PREFIX}${today}`)
    const todayLabel = WEEKDAYS[currentWeek().indexOf(today)]
    expect(column.props.accessibilityLabel).toBe(`${todayLabel}: Ansiosa`)
    expect(within(column).getByTestId(TEST_IDS.EMOTION_ICON, HIDDEN)).toBeTruthy()
    expect(received).toEqual([{ period: 'week', localDate: today }])
    for (const [index, key] of currentWeek().entries()) {
      expect(screen.getByText(WEEKDAYS[index])).toBeTruthy()
      if (key !== today) {
        const other = screen.getByTestId(`${TEST_IDS.EMOTIONS_DAY_PREFIX}${key}`)
        expect(other.props.accessibilityLabel).toBe(`${WEEKDAYS[index]}: sem check-in`)
        expect(within(other).queryByTestId(TEST_IDS.EMOTION_ICON, HIDDEN)).toBeNull()
      }
    }
    expect(screen.getByTestId('mock-emotion-chart').props.children).toBe('week:7')
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
    await renderWithProviders(<EmotionsScreen />)
    await screen.findByTestId('mock-emotion-chart')
    await fireEvent.press(screen.getByTestId(`${TEST_IDS.EMOTIONS_SEGMENT_PREFIX}month`))
    for (const day of ['1', '8', '15', '22']) {
      expect(await screen.findByText(day)).toBeTruthy()
    }
    expect(screen.queryByTestId(TEST_IDS.EMOTION_ICON, HIDDEN)).toBeNull()
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
    await renderWithProviders(<EmotionsScreen />)
    await screen.findByTestId('mock-emotion-chart')
    await fireEvent.press(screen.getByTestId(`${TEST_IDS.EMOTIONS_SEGMENT_PREFIX}year`))
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
    await renderWithProviders(<EmotionsScreen />)
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
    await renderWithProviders(<EmotionsScreen />)
    expect(await screen.findByText('Você ainda não fez check-in neste período.')).toBeTruthy()
    expect(screen.queryByText('Principais percepções')).toBeNull()
    await fireEvent.press(screen.getByText('Fazer check-in'))
    expect(push).toHaveBeenCalledWith(ROUTES.CHECK_IN)
  })

  it('shows the chart and the no-insight message when the period only holds "Outro" check-ins', async () => {
    server.use(
      mockQuery('emotion.summary', () => ({
        ...weekSummary(null),
        points: currentWeek().map((key) => ({ key, score: null, state: null })),
        hasCheckIns: true,
      })),
    )
    await renderWithProviders(<EmotionsScreen />)
    expect(await screen.findByTestId('mock-emotion-chart')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.EMOTIONS_NO_INSIGHTS)).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.EMOTIONS_EMPTY)).toBeNull()
  })

  it('explains that the insights come with more check-ins when there are none yet', async () => {
    server.use(mockQuery('emotion.summary', () => weekSummary('anxious')))
    await renderWithProviders(<EmotionsScreen />)
    expect(
      await screen.findByText('As percepções aparecem conforme você registra seus dias.'),
    ).toBeTruthy()
  })

  it('offers to try again when the summary fails', async () => {
    server.use(mockTrpcError('emotion.summary', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<EmotionsScreen />)
    expect(await screen.findByText('Tentar de novo')).toBeTruthy()
    server.use(mockQuery('emotion.summary', () => weekSummary('anxious')))
    await fireEvent.press(screen.getByText('Tentar de novo'))
    await waitFor(() => expect(screen.getByTestId('mock-emotion-chart')).toBeTruthy())
  })

  it('goes back from the header', async () => {
    server.use(mockQuery('emotion.summary', () => weekSummary(null)))
    await renderWithProviders(<EmotionsScreen />)
    await fireEvent.press(screen.getByLabelText('Voltar'))
    expect(back).toHaveBeenCalledTimes(1)
  })
})

import { TEST_IDS, TRPC_ERROR_CODES } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { addDays, format, startOfWeek } from 'date-fns'
import { useRouter } from 'expo-router'
import { ToastAndroid } from 'react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { JourneyScreen } from './journey.screen'

const mockScrollTo = jest.fn()

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))
jest.mock(
  'react-native-reanimated',
  () => require('../../../tests/utils/reanimated-mock').reanimatedModule,
)
// The real ScrollView of the Jest setup has no scrollTo; this one reports where it was asked to scroll.
jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
  const { forwardRef, useImperativeHandle } = require('react')
  const { View } = require('react-native')
  const MockScrollView = forwardRef(function MockScrollView(
    { children, contentContainerStyle }: { children: unknown; contentContainerStyle: unknown },
    reference: unknown,
  ) {
    useImperativeHandle(reference, () => ({ scrollTo: mockScrollTo }))
    return <View style={contentContainerStyle}>{children}</View>
  })
  return { __esModule: true, default: MockScrollView }
})

const DATE_FORMAT = 'yyyy-MM-dd'

function currentWeek(checkedDays: number) {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, offset) => ({
    localDate: format(addDays(monday, offset), DATE_FORMAT),
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

const push = jest.fn()
const showToast = jest.spyOn(ToastAndroid, 'show').mockImplementation(() => {})

beforeEach(() => {
  jest.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>)
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('JourneyScreen', () => {
  it('shows a skeleton while the overview loads', async () => {
    server.use(mockQuery('journey.overview', () => overview(1, 1, [])))
    await renderWithProviders(<JourneyScreen />)
    expect(screen.getByText('Minha jornada')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.JOURNEY_SKELETON)).toBeTruthy()
    await waitFor(() => expect(screen.queryByTestId(TEST_IDS.JOURNEY_SKELETON)).toBeNull())
  })

  it('shows the streak, the week dots and the phrase', async () => {
    server.use(mockQuery('journey.overview', () => overview(8, 5, [])))
    await renderWithProviders(<JourneyScreen />)
    await waitFor(() =>
      expect(screen.getByTestId(TEST_IDS.JOURNEY_STREAK_NUMBER).props.children).toBe('8'),
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
    expect(screen.getByText('Visão geral')).toBeTruthy()
    // The segment and the heading of the list share the label.
    expect(screen.getAllByText('Minhas conquistas')).toHaveLength(2)
  })

  it('uses the singular for one day', async () => {
    server.use(mockQuery('journey.overview', () => overview(1, 1, [])))
    await renderWithProviders(<JourneyScreen />)
    await waitFor(() => expect(screen.getByText('dia consecutivo')).toBeTruthy())
  })

  it('lists the achievements in order', async () => {
    server.use(mockQuery('journey.overview', () => overview(3, 3, FULL_ACHIEVEMENTS)))
    await renderWithProviders(<JourneyScreen />)
    await waitFor(() => expect(screen.getByText('Fiz 5 check-ins esta semana')).toBeTruthy())
    expect(screen.getByText('Quando o desânimo pesar: 1 de 3 dias')).toBeTruthy()
    expect(screen.getByText('Concluí 2 planos')).toBeTruthy()
    expect(screen.getByText('Fiz 1 prática')).toBeTruthy()
    expect(screen.getByText('Concluí 3 ações do dia')).toBeTruthy()
  })

  it('shows a welcoming message when there are no achievements', async () => {
    server.use(mockQuery('journey.overview', () => overview(0, 0, [])))
    await renderWithProviders(<JourneyScreen />)
    await waitFor(() =>
      expect(
        screen.getByText('Suas conquistas aparecem aqui conforme você usa o app.'),
      ).toBeTruthy(),
    )
  })

  it('opens Minhas emoções from its segment', async () => {
    server.use(mockQuery('journey.overview', () => overview(1, 1, [])))
    await renderWithProviders(<JourneyScreen />)
    await fireEvent.press(screen.getByTestId(`${TEST_IDS.JOURNEY_SEGMENT_PREFIX}emotions`))
    expect(push).toHaveBeenCalledWith(ROUTES.EMOTIONS)
  })

  it('scrolls to the achievements and back to the top', async () => {
    server.use(mockQuery('journey.overview', () => overview(1, 1, FULL_ACHIEVEMENTS)))
    await renderWithProviders(<JourneyScreen />)
    await fireEvent.press(screen.getByTestId(`${TEST_IDS.JOURNEY_SEGMENT_PREFIX}achievements`))
    expect(mockScrollTo).toHaveBeenLastCalledWith({ y: expect.any(Number), animated: true })
    expect(mockScrollTo.mock.lastCall?.[0].y).toBeGreaterThan(0)
    await fireEvent.press(screen.getByTestId(`${TEST_IDS.JOURNEY_SEGMENT_PREFIX}overview`))
    expect(mockScrollTo).toHaveBeenLastCalledWith({ y: 0, animated: true })
  })

  it('shows "Em breve" for the calendar, "Ver todas" and an achievement row', async () => {
    server.use(mockQuery('journey.overview', () => overview(1, 1, FULL_ACHIEVEMENTS)))
    await renderWithProviders(<JourneyScreen />)
    await waitFor(() => expect(screen.getByTestId(TEST_IDS.JOURNEY_CALENDAR)).toBeTruthy())
    await fireEvent.press(screen.getByTestId(TEST_IDS.JOURNEY_CALENDAR))
    await fireEvent.press(screen.getByTestId(TEST_IDS.JOURNEY_VIEW_ALL))
    await fireEvent.press(
      screen.getByTestId(`${TEST_IDS.JOURNEY_ACHIEVEMENT_PREFIX}completed-plans`),
    )
    expect(showToast).toHaveBeenCalledTimes(3)
    expect(showToast).toHaveBeenCalledWith('Em breve', ToastAndroid.SHORT)
  })

  it('shows the error state and retries', async () => {
    server.use(mockTrpcError('journey.overview', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<JourneyScreen />)
    await waitFor(() => expect(screen.getByText('Tentar de novo')).toBeTruthy())
    server.use(mockQuery('journey.overview', () => overview(4, 2, [])))
    await act(async () => {
      await fireEvent.press(screen.getByText('Tentar de novo'))
    })
    await waitFor(() =>
      expect(screen.getByTestId(TEST_IDS.JOURNEY_STREAK_NUMBER).props.children).toBe('4'),
    )
  })
})

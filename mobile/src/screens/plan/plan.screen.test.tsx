import { TEST_IDS, TRPC_ERROR_CODES } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { HttpResponse, http } from 'msw/http'
import { ToastAndroid } from 'react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { PlanScreen } from './plan.screen'

jest.mock('expo-router', () => ({ useRouter: jest.fn(), useLocalSearchParams: jest.fn() }))
jest.mock(
  'react-native-reanimated',
  () => require('../../../tests/utils/reanimated-mock').reanimatedModule,
)

const PLAN_ID = 'when-discouragement-weighs'

const DAYS = [
  { dayNumber: 1, title: 'Respirar e reconhecer', summary: 'Pare por um momento e respire.' },
  { dayNumber: 2, title: 'Pequenos movimentos', summary: 'Escolha um gesto pequeno.' },
  { dayNumber: 3, title: 'Voltar a acreditar', summary: 'Releia o caminho até aqui.' },
]

function planDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: PLAN_ID,
    title: 'Quando o desânimo pesar',
    category: 'emotions',
    totalDays: 3,
    description: 'Um plano curto para te ajudar a respirar.',
    isEnrolled: false,
    completedDayNumbers: [],
    days: DAYS,
    reflections: [],
    ...overrides,
  }
}

describe('PlanScreen', () => {
  const push = jest.fn()
  const back = jest.fn()

  beforeEach(() => {
    push.mockClear()
    back.mockClear()
    jest
      .mocked(useRouter)
      .mockReturnValue({ push, back } as unknown as ReturnType<typeof useRouter>)
    jest.mocked(useLocalSearchParams).mockReturnValue({ planId: PLAN_ID })
  })

  it('shows the title, the durations, the description and the three day rows', async () => {
    server.use(mockQuery('plan.detail', () => planDetail()))
    await renderWithProviders(<PlanScreen />)
    await waitFor(() => expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy())
    expect(screen.getByText('3 dias')).toBeTruthy()
    expect(screen.getByText('5 a 10 min por dia')).toBeTruthy()
    expect(screen.getByText('Um plano curto para te ajudar a respirar.')).toBeTruthy()
    for (const day of DAYS) {
      expect(screen.getByTestId(`${TEST_IDS.PLAN_DAY_ROW_PREFIX}${day.dayNumber}`)).toBeTruthy()
      expect(screen.getByText(day.title)).toBeTruthy()
      expect(screen.getByText(`Dia ${day.dayNumber}`)).toBeTruthy()
    }
    expect(screen.getByText('Visão geral')).toBeTruthy()
    expect(screen.getByText('Começar plano')).toBeTruthy()
  })

  it('asks the API for the plan of the route', async () => {
    const requested = jest.fn()
    server.use(
      mockQuery('plan.detail', (input) => {
        requested(input)
        return planDetail()
      }),
    )
    await renderWithProviders(<PlanScreen />)
    await waitFor(() => expect(requested).toHaveBeenCalledWith({ planId: PLAN_ID }))
  })

  it('starts the plan once, even when pressed twice, and then opens day 1', async () => {
    let enrolled = false
    let release = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const started = jest.fn()
    server.use(
      mockQuery('plan.detail', () => planDetail({ isEnrolled: enrolled })),
      mockQuery('plan.current', () => null),
      http.post(`${TEST_API_BASE_URL}/trpc/plan.start`, async () => {
        started()
        await gate
        enrolled = true
        return HttpResponse.json({
          result: { data: { planId: PLAN_ID, startedAt: '2026-10-20T12:00:00.000Z' } },
        })
      }),
    )
    await renderWithProviders(<PlanScreen />)
    await waitFor(() => expect(screen.getByText('Começar plano')).toBeTruthy())

    await fireEvent.press(screen.getByTestId(TEST_IDS.PLAN_PRIMARY_BUTTON))
    await fireEvent.press(screen.getByTestId(TEST_IDS.PLAN_PRIMARY_BUTTON))
    await waitFor(() => expect(started).toHaveBeenCalledTimes(1))
    expect(
      screen.getByTestId(
        `${TEST_IDS.PLAN_PRIMARY_BUTTON}${TEST_IDS.PRIMARY_BUTTON_SPINNER_SUFFIX}`,
      ),
    ).toBeTruthy()
    expect(push).not.toHaveBeenCalled()

    await act(async () => release())
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith({
        pathname: ROUTES.PLAN_DAY,
        params: { planId: PLAN_ID, dayNumber: '1' },
      }),
    )
    expect(push).toHaveBeenCalledTimes(1)
    expect(started).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.getByText('Continuar plano')).toBeTruthy())
  })

  it('tells the person when the plan could not be started and stays on the screen', async () => {
    const show = jest.spyOn(ToastAndroid, 'show').mockImplementation(() => {})
    server.use(
      mockQuery('plan.detail', () => planDetail()),
      mockTrpcError('plan.start', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500),
    )
    await renderWithProviders(<PlanScreen />)
    await waitFor(() => expect(screen.getByText('Começar plano')).toBeTruthy())

    await fireEvent.press(screen.getByTestId(TEST_IDS.PLAN_PRIMARY_BUTTON))
    await waitFor(() =>
      expect(show).toHaveBeenCalledWith(
        'Não foi possível começar o plano agora.',
        ToastAndroid.SHORT,
      ),
    )
    expect(push).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.getByText('Começar plano')).toBeTruthy())
    show.mockRestore()
  })

  it('continues on the first day that is not done and marks the finished one', async () => {
    server.use(
      mockQuery('plan.detail', () => planDetail({ isEnrolled: true, completedDayNumbers: [1] })),
    )
    await renderWithProviders(<PlanScreen />)
    await waitFor(() => expect(screen.getByText('Continuar plano')).toBeTruthy())
    expect(screen.getByTestId('plan-day-row-1-completed')).toBeTruthy()
    expect(screen.queryByTestId('plan-day-row-2-completed')).toBeNull()

    await fireEvent.press(screen.getByTestId(TEST_IDS.PLAN_PRIMARY_BUTTON))
    expect(push).toHaveBeenCalledWith({
      pathname: ROUTES.PLAN_DAY,
      params: { planId: PLAN_ID, dayNumber: '2' },
    })
  })

  it('disables the button once every day is done', async () => {
    server.use(
      mockQuery('plan.detail', () =>
        planDetail({ isEnrolled: true, completedDayNumbers: [1, 2, 3] }),
      ),
    )
    await renderWithProviders(<PlanScreen />)
    await waitFor(() => expect(screen.getByText('Plano concluído')).toBeTruthy())
    const button = screen.getByTestId(TEST_IDS.PLAN_PRIMARY_BUTTON)
    expect(button.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }))
    await fireEvent.press(button)
    expect(push).not.toHaveBeenCalled()
  })

  it('opens the day of the row that was pressed', async () => {
    server.use(mockQuery('plan.detail', () => planDetail()))
    await renderWithProviders(<PlanScreen />)
    await waitFor(() => expect(screen.getByText('Voltar a acreditar')).toBeTruthy())
    await fireEvent.press(screen.getByTestId(`${TEST_IDS.PLAN_DAY_ROW_PREFIX}3`))
    expect(push).toHaveBeenCalledWith({
      pathname: ROUTES.PLAN_DAY,
      params: { planId: PLAN_ID, dayNumber: '3' },
    })
  })

  it('lists the summary of each day under Conteúdo', async () => {
    server.use(mockQuery('plan.detail', () => planDetail()))
    await renderWithProviders(<PlanScreen />)
    await waitFor(() => expect(screen.getByText('Conteúdo')).toBeTruthy())
    await fireEvent.press(screen.getByTestId(`${TEST_IDS.PLAN_SEGMENT_PREFIX}content`))
    for (const day of DAYS) {
      expect(screen.getByText(day.summary)).toBeTruthy()
      expect(screen.getByText(day.title)).toBeTruthy()
    }
    expect(screen.queryByTestId(`${TEST_IDS.PLAN_DAY_ROW_PREFIX}1`)).toBeNull()

    await fireEvent.press(screen.getByTestId(`${TEST_IDS.PLAN_SEGMENT_PREFIX}overview`))
    expect(screen.getByTestId(`${TEST_IDS.PLAN_DAY_ROW_PREFIX}1`)).toBeTruthy()
  })

  it('lists the reflections of the person under Reflexões', async () => {
    server.use(
      mockQuery('plan.detail', () =>
        planDetail({
          isEnrolled: true,
          completedDayNumbers: [1],
          reflections: [
            {
              dayNumber: 1,
              dayTitle: 'Respirar e reconhecer',
              text: 'Hoje consegui parar um pouco.',
              completedAt: '2026-10-18T15:00:00.000Z',
            },
          ],
        }),
      ),
    )
    await renderWithProviders(<PlanScreen />)
    await waitFor(() => expect(screen.getByText('Reflexões')).toBeTruthy())
    await fireEvent.press(screen.getByTestId(`${TEST_IDS.PLAN_SEGMENT_PREFIX}reflections`))
    expect(screen.getByText('Hoje consegui parar um pouco.')).toBeTruthy()
    expect(screen.getByText('Respirar e reconhecer')).toBeTruthy()
    expect(screen.getByText('18 de outubro')).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.PLAN_REFLECTIONS_EMPTY)).toBeNull()
  })

  it('shows a welcoming message when there is no reflection yet', async () => {
    server.use(mockQuery('plan.detail', () => planDetail()))
    await renderWithProviders(<PlanScreen />)
    await waitFor(() => expect(screen.getByText('Reflexões')).toBeTruthy())
    await fireEvent.press(screen.getByTestId(`${TEST_IDS.PLAN_SEGMENT_PREFIX}reflections`))
    expect(
      screen.getByText('Quando você concluir um dia e contar como foi, sua reflexão aparece aqui.'),
    ).toBeTruthy()
  })

  it('shows skeletons, never a spinner, while the plan loads', async () => {
    let release = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/plan.detail`, async () => {
        await gate
        return HttpResponse.json({ result: { data: planDetail() } })
      }),
    )
    await renderWithProviders(<PlanScreen />)
    expect(screen.getAllByLabelText('Carregando').length).toBeGreaterThan(0)
    expect(JSON.stringify(screen.toJSON())).not.toContain('"ActivityIndicator"')
    expect(screen.queryByTestId(TEST_IDS.PLAN_PRIMARY_BUTTON)).toBeNull()

    await act(async () => release())
    await waitFor(() => expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy())
    expect(screen.queryAllByLabelText('Carregando')).toHaveLength(0)
  })

  it('shows the error state when the plan does not exist and tries again on demand', async () => {
    server.use(mockTrpcError('plan.detail', TRPC_ERROR_CODES.NOT_FOUND, 404))
    await renderWithProviders(<PlanScreen />)
    await waitFor(() => expect(screen.getByText('Tentar de novo')).toBeTruthy())
    expect(screen.getByText('Não foi possível carregar agora.')).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.PLAN_PRIMARY_BUTTON)).toBeNull()

    server.use(mockQuery('plan.detail', () => planDetail()))
    await fireEvent.press(screen.getByText('Tentar de novo'))
    await waitFor(() => expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy())
  })

  it('goes back and sends the three dots to the coming soon notice', async () => {
    const show = jest.spyOn(ToastAndroid, 'show').mockImplementation(() => {})
    server.use(mockQuery('plan.detail', () => planDetail()))
    await renderWithProviders(<PlanScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }))
    expect(back).toHaveBeenCalledTimes(1)
    await fireEvent.press(screen.getByRole('button', { name: 'Mais opções' }))
    expect(show).toHaveBeenCalledWith('Em breve', ToastAndroid.SHORT)
    show.mockRestore()
    await waitFor(() => expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy())
  })

  it('translates the labels to English', async () => {
    const { i18n } = require('../../i18n/config')
    await i18n.changeLanguage('en')
    server.use(mockQuery('plan.detail', () => planDetail()))
    await renderWithProviders(<PlanScreen />)
    await waitFor(() => expect(screen.getByText('Start plan')).toBeTruthy())
    expect(screen.getByText('5 to 10 min a day')).toBeTruthy()
    expect(screen.getByText('Day 1')).toBeTruthy()
    await i18n.changeLanguage('pt-BR')
  })
})

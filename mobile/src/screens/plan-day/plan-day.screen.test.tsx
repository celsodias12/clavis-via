import { TEST_IDS, TRPC_ERROR_CODES } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { HttpResponse, http } from 'msw/http'
import { ToastAndroid } from 'react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { PlanDayScreen } from './plan-day.screen'

jest.mock('expo-router', () => ({ useRouter: jest.fn(), useLocalSearchParams: jest.fn() }))
jest.mock(
  'react-native-reanimated',
  () => require('../../../tests/utils/reanimated-mock').reanimatedModule,
)

const PLAN_ID = 'when-discouragement-weighs'
const MESSAGE =
  'Antes de exigir força de você, vamos aprender a respirar. Nem todo dia precisa ser produtivo.'

function planDay(overrides: Record<string, unknown> = {}) {
  return {
    planId: PLAN_ID,
    planTitle: 'Quando o desânimo pesar',
    totalDays: 3,
    dayNumber: 1,
    title: 'Respirar e reconhecer',
    videoDurationSeconds: 138,
    message: MESSAGE,
    reflection: 'O que pesa em você hoje?',
    action: 'Pare por um minuto e respire fundo três vezes.',
    tip: 'Faça isso em um lugar quieto.',
    prayer: 'Senhor, me ensina a descansar em Ti.',
    completion: null,
    ...overrides,
  }
}

function segment(key: string) {
  return screen.getByTestId(`${TEST_IDS.DAY_SEGMENT_PREFIX}${key}`)
}

describe('PlanDayScreen', () => {
  const push = jest.fn()
  const back = jest.fn()

  beforeEach(() => {
    push.mockClear()
    back.mockClear()
    jest
      .mocked(useRouter)
      .mockReturnValue({ push, back } as unknown as ReturnType<typeof useRouter>)
    jest.mocked(useLocalSearchParams).mockReturnValue({ planId: PLAN_ID, dayNumber: '1' })
  })

  it('shows the header, the title, the video length and the message of today', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    await renderWithProviders(<PlanDayScreen />)
    await waitFor(() => expect(screen.getByText('Respirar e reconhecer')).toBeTruthy())
    expect(screen.getByText('Dia 1 de 3')).toBeTruthy()
    expect(screen.getByText('2:18 min')).toBeTruthy()
    expect(screen.getByText('Mensagem de hoje')).toBeTruthy()
    expect(screen.getByText(MESSAGE)).toBeTruthy()
    for (const label of ['Conteúdo', 'Reflexão', 'Ação', 'Oração']) {
      expect(screen.getByText(label)).toBeTruthy()
    }
  })

  it('asks the API for the day of the route', async () => {
    const requested = jest.fn()
    server.use(
      mockQuery('plan.day', (input) => {
        requested(input)
        return planDay()
      }),
    )
    await renderWithProviders(<PlanDayScreen />)
    await waitFor(() => expect(requested).toHaveBeenCalledWith({ planId: PLAN_ID, dayNumber: 1 }))
  })

  it('walks Conteúdo, Reflexão, Ação and Oração with Próximo and back with Anterior', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    await renderWithProviders(<PlanDayScreen />)
    await waitFor(() => expect(screen.getByText(MESSAGE)).toBeTruthy())
    const previous = () => screen.getByTestId(TEST_IDS.DAY_PREVIOUS_BUTTON)
    const next = () => screen.getByTestId(TEST_IDS.DAY_NEXT_BUTTON)
    expect(previous().props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }))

    await fireEvent.press(next())
    expect(screen.getByText('O que pesa em você hoje?')).toBeTruthy()
    expect(screen.queryByText(MESSAGE)).toBeNull()
    expect(segment('reflection').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    )

    await fireEvent.press(next())
    expect(screen.getByText('Pare por um minuto e respire fundo três vezes.')).toBeTruthy()

    await fireEvent.press(next())
    expect(screen.getByText('Senhor, me ensina a descansar em Ti.')).toBeTruthy()
    expect(next().props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }))
    await fireEvent.press(next())
    expect(screen.getByText('Senhor, me ensina a descansar em Ti.')).toBeTruthy()

    await fireEvent.press(previous())
    expect(screen.getByText('Pare por um minuto e respire fundo três vezes.')).toBeTruthy()
    await fireEvent.press(previous())
    await fireEvent.press(previous())
    expect(screen.getByText(MESSAGE)).toBeTruthy()
  })

  it('jumps to a segment when it is pressed and shows the action with its button', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    await renderWithProviders(<PlanDayScreen />)
    await waitFor(() => expect(screen.getByText(MESSAGE)).toBeTruthy())
    await fireEvent.press(segment('action'))
    expect(screen.getByText('Pare por um minuto e respire fundo três vezes.')).toBeTruthy()
    expect(screen.getByText('Ir para a ação do dia')).toBeTruthy()

    await fireEvent.press(screen.getByTestId(TEST_IDS.DAY_ACTION_BUTTON))
    expect(push).toHaveBeenCalledWith({
      pathname: ROUTES.PLAN_DAY_ACTION,
      params: { planId: PLAN_ID, dayNumber: '1' },
    })

    await fireEvent.press(segment('prayer'))
    expect(screen.queryByTestId(TEST_IDS.DAY_ACTION_BUTTON)).toBeNull()
  })

  it('sends the video play and the three dots to the coming soon notice', async () => {
    const show = jest.spyOn(ToastAndroid, 'show').mockImplementation(() => {})
    server.use(mockQuery('plan.day', () => planDay()))
    await renderWithProviders(<PlanDayScreen />)
    await waitFor(() => expect(screen.getByText(MESSAGE)).toBeTruthy())
    await fireEvent.press(screen.getByTestId(TEST_IDS.VIDEO_PLAY))
    expect(show).toHaveBeenCalledWith('Em breve', ToastAndroid.SHORT)
    show.mockClear()
    await fireEvent.press(screen.getByRole('button', { name: 'Mais opções' }))
    expect(show).toHaveBeenCalledWith('Em breve', ToastAndroid.SHORT)
    show.mockRestore()
  })

  it('goes back from the header arrow', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    await renderWithProviders(<PlanDayScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }))
    expect(back).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.getByText(MESSAGE)).toBeTruthy())
  })

  it('shows skeletons, never a spinner, while the day loads', async () => {
    let release = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/plan.day`, async () => {
        await gate
        return HttpResponse.json({ result: { data: planDay() } })
      }),
    )
    await renderWithProviders(<PlanDayScreen />)
    expect(screen.getAllByLabelText('Carregando').length).toBeGreaterThan(0)
    expect(JSON.stringify(screen.toJSON())).not.toContain('"ActivityIndicator"')
    expect(screen.queryByTestId(TEST_IDS.DAY_NEXT_BUTTON)).toBeNull()

    await act(async () => release())
    await waitFor(() => expect(screen.getByText('Respirar e reconhecer')).toBeTruthy())
    expect(screen.queryAllByLabelText('Carregando')).toHaveLength(0)
  })

  it('shows the error state for a day number that is not valid, without a request', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ planId: PLAN_ID, dayNumber: 'abc' })
    const requested = jest.fn()
    server.use(
      mockQuery('plan.day', (input) => {
        requested(input)
        return planDay()
      }),
    )
    await renderWithProviders(<PlanDayScreen />)
    expect(screen.getByText('Não foi possível carregar agora.')).toBeTruthy()
    expect(screen.queryAllByLabelText('Carregando')).toHaveLength(0)
    await fireEvent.press(screen.getByText('Tentar de novo'))
    expect(back).toHaveBeenCalledTimes(1)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(requested).not.toHaveBeenCalled()
  })

  it('shows the error state when the day does not exist and tries again on demand', async () => {
    server.use(mockTrpcError('plan.day', TRPC_ERROR_CODES.NOT_FOUND, 404))
    await renderWithProviders(<PlanDayScreen />)
    await waitFor(() => expect(screen.getByText('Tentar de novo')).toBeTruthy())
    expect(screen.queryByTestId(TEST_IDS.DAY_NEXT_BUTTON)).toBeNull()

    server.use(mockQuery('plan.day', () => planDay()))
    await fireEvent.press(screen.getByText('Tentar de novo'))
    await waitFor(() => expect(screen.getByText('Respirar e reconhecer')).toBeTruthy())
    expect(back).not.toHaveBeenCalled()
  })

  it('translates the labels to English', async () => {
    const { i18n } = require('../../i18n/config')
    await i18n.changeLanguage('en')
    server.use(mockQuery('plan.day', () => planDay()))
    await renderWithProviders(<PlanDayScreen />)
    await waitFor(() => expect(screen.getByText('Day 1 of 3')).toBeTruthy())
    expect(screen.getByText("Today's message")).toBeTruthy()
    expect(screen.getByText('Next')).toBeTruthy()
    expect(screen.getByText('Previous')).toBeTruthy()
    await i18n.changeLanguage('pt-BR')
  })
})

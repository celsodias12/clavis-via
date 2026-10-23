import { TEST_IDS, TRPC_ERROR_CODES } from '@clavis-via/shared'
import {
  mockMutation,
  mockQuery,
  mockTrpcError,
  server,
  TEST_API_BASE_URL,
} from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { HttpResponse, http } from 'msw/http'
import { Platform, ToastAndroid } from 'react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { DayActionScreen } from './day-action.screen'

jest.mock('expo-router', () => ({ useRouter: jest.fn(), useLocalSearchParams: jest.fn() }))
jest.mock(
  'react-native-reanimated',
  () => require('../../../tests/utils/reanimated-mock').reanimatedModule,
)

const PLAN_ID = 'learning-to-set-boundaries'
const ACTION = 'Diga um “não” pequeno para algo que você faria apenas para não desagradar.'
const TIP = 'Colocar limites não é se afastar das pessoas, é se aproximar de quem realmente você é.'

function planDay(overrides: Record<string, unknown> = {}) {
  return {
    planId: PLAN_ID,
    planTitle: 'Aprendendo a colocar limites',
    totalDays: 7,
    dayNumber: 1,
    title: 'Limites que protegem',
    videoDurationSeconds: 138,
    message: 'Mensagem.',
    reflection: 'Reflexão.',
    action: ACTION,
    tip: TIP,
    prayer: 'Oração.',
    completion: null,
    ...overrides,
  }
}

const COMPLETION = {
  planId: PLAN_ID,
  dayNumber: 1,
  reflection: null,
  completedAt: '2026-10-20T12:00:00.000Z',
}

function completeButton() {
  return screen.getByTestId(TEST_IDS.DAY_ACTION_COMPLETE_BUTTON)
}

function reflectionField() {
  return screen.getByTestId(TEST_IDS.DAY_ACTION_REFLECTION)
}

describe('DayActionScreen', () => {
  const back = jest.fn()
  const dismissTo = jest.fn()
  let toast: jest.SpyInstance

  beforeEach(() => {
    back.mockClear()
    dismissTo.mockClear()
    toast = jest.spyOn(ToastAndroid, 'show').mockImplementation(() => {})
    jest
      .mocked(useRouter)
      .mockReturnValue({ back, dismissTo } as unknown as ReturnType<typeof useRouter>)
    jest.mocked(useLocalSearchParams).mockReturnValue({ planId: PLAN_ID, dayNumber: '1' })
  })

  afterEach(() => {
    toast.mockRestore()
  })

  it('shows the action and the tip of the day of the design', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    await renderWithProviders(<DayActionScreen />)
    await waitFor(() => expect(screen.getByText(ACTION)).toBeTruthy())
    expect(screen.getByText('Ação do dia')).toBeTruthy()
    expect(screen.getByText('Dica da Thalita')).toBeTruthy()
    expect(screen.getByText(`“${TIP}”`)).toBeTruthy()
    expect(screen.getByText('Marcar como concluída')).toBeTruthy()
    expect(screen.getByText('Como foi para você?')).toBeTruthy()
    expect(reflectionField().props.placeholder).toBe('Escreva aqui sua reflexão...')
    expect(reflectionField().props.maxLength).toBe(1000)
    expect(reflectionField().props.multiline).toBe(true)
  })

  it('asks the API for the day of the route and goes back with the arrow', async () => {
    const requested = jest.fn()
    server.use(
      mockQuery('plan.day', (input) => {
        requested(input)
        return planDay()
      }),
    )
    await renderWithProviders(<DayActionScreen />)
    await waitFor(() => expect(requested).toHaveBeenCalledWith({ planId: PLAN_ID, dayNumber: 1 }))
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }))
    expect(back).toHaveBeenCalledTimes(1)
  })

  it.each(['ios', 'android'] as const)(
    'completes the day once with the reflection, shows the toast and returns to the plan on %s',
    async (platform) => {
      const operatingSystem = jest.replaceProperty(Platform, 'OS', platform)
      try {
        let release = () => {}
        const gate = new Promise<void>((resolve) => {
          release = resolve
        })
        const completed = jest.fn()
        server.use(
          mockQuery('plan.day', () => planDay()),
          http.post(`${TEST_API_BASE_URL}/trpc/plan.completeDay`, async ({ request }) => {
            completed(await request.json())
            await gate
            return HttpResponse.json({ result: { data: COMPLETION } })
          }),
        )
        await renderWithProviders(<DayActionScreen />)
        await waitFor(() => expect(screen.getByText(ACTION)).toBeTruthy())
        await fireEvent.changeText(reflectionField(), '  Respirei.  ')

        await fireEvent.press(completeButton())
        await fireEvent.press(completeButton())
        await waitFor(() => expect(completed).toHaveBeenCalledTimes(1))
        expect(
          screen.getByTestId(
            `${TEST_IDS.DAY_ACTION_COMPLETE_BUTTON}${TEST_IDS.PRIMARY_BUTTON_SPINNER_SUFFIX}`,
          ),
        ).toBeTruthy()
        expect(dismissTo).not.toHaveBeenCalled()

        await act(async () => release())

        await waitFor(() =>
          expect(dismissTo).toHaveBeenCalledWith({
            pathname: ROUTES.PLAN,
            params: { planId: PLAN_ID },
          }),
        )
        expect(completed).toHaveBeenCalledTimes(1)
        expect(completed).toHaveBeenCalledWith({
          planId: PLAN_ID,
          dayNumber: 1,
          reflection: 'Respirei.',
        })
        expect(toast).toHaveBeenCalledWith('Dia concluído.', ToastAndroid.SHORT)
        expect(dismissTo).toHaveBeenCalledTimes(1)
      } finally {
        operatingSystem.restore()
      }
    },
  )

  it('sends a blank reflection as undefined', async () => {
    const completed = jest.fn()
    server.use(
      mockQuery('plan.day', () => planDay()),
      mockMutation('plan.completeDay', (input) => {
        completed(input)
        return COMPLETION
      }),
    )
    await renderWithProviders(<DayActionScreen />)
    await waitFor(() => expect(screen.getByText(ACTION)).toBeTruthy())
    await fireEvent.changeText(reflectionField(), '   ')

    await fireEvent.press(completeButton())

    await waitFor(() => expect(dismissTo).toHaveBeenCalledTimes(1))
    expect(completed).toHaveBeenCalledWith({ planId: PLAN_ID, dayNumber: 1 })
  })

  it('shows the field error for 1001 characters and sends nothing', async () => {
    const completed = jest.fn()
    server.use(
      mockQuery('plan.day', () => planDay()),
      mockMutation('plan.completeDay', (input) => {
        completed(input)
        return COMPLETION
      }),
    )
    await renderWithProviders(<DayActionScreen />)
    await waitFor(() => expect(screen.getByText(ACTION)).toBeTruthy())
    await fireEvent.changeText(reflectionField(), 'a'.repeat(1001))

    await waitFor(() => expect(screen.getByText('Escreva no máximo 1000 caracteres.')).toBeTruthy())
    await fireEvent.press(completeButton())

    expect(completed).not.toHaveBeenCalled()
    expect(dismissTo).not.toHaveBeenCalled()
  })

  it('shows an already completed day as done, with the saved reflection read-only', async () => {
    server.use(
      mockQuery('plan.day', () =>
        planDay({
          completion: { reflection: 'Respirei.', completedAt: '2026-10-20T12:00:00.000Z' },
        }),
      ),
    )
    await renderWithProviders(<DayActionScreen />)
    await waitFor(() => expect(screen.getByText('Dia concluído')).toBeTruthy())
    expect(screen.queryByText('Marcar como concluída')).toBeNull()
    expect(completeButton().props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    )
    expect(reflectionField().props.value).toBe('Respirei.')
    expect(reflectionField().props.editable).toBe(false)
    await fireEvent.press(completeButton())
    expect(dismissTo).not.toHaveBeenCalled()
  })

  it('shows an empty read-only field for a completed day without reflection', async () => {
    server.use(
      mockQuery('plan.day', () =>
        planDay({ completion: { reflection: null, completedAt: '2026-10-20T12:00:00.000Z' } }),
      ),
    )
    await renderWithProviders(<DayActionScreen />)
    await waitFor(() => expect(screen.getByText('Dia concluído')).toBeTruthy())
    expect(reflectionField().props.value).toBe('')
    expect(reflectionField().props.editable).toBe(false)
  })

  it('keeps what was typed and says it could not save when the API fails', async () => {
    server.use(
      mockQuery('plan.day', () => planDay()),
      mockTrpcError('plan.completeDay', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500),
    )
    await renderWithProviders(<DayActionScreen />)
    await waitFor(() => expect(screen.getByText(ACTION)).toBeTruthy())
    await fireEvent.changeText(reflectionField(), 'Respirei.')

    await fireEvent.press(completeButton())

    await waitFor(() => expect(screen.getByText('Não foi possível salvar agora.')).toBeTruthy())
    expect(reflectionField().props.value).toBe('Respirei.')
    expect(dismissTo).not.toHaveBeenCalled()
    expect(toast).not.toHaveBeenCalled()
    expect(screen.getByTestId(TEST_IDS.DAY_ACTION_ERROR).props.accessibilityLiveRegion).toBe(
      'polite',
    )
  })

  it('shows a skeleton while the day loads', async () => {
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/plan.day`, async () => {
        await new Promise(() => {})
        return HttpResponse.json({})
      }),
    )
    await renderWithProviders(<DayActionScreen />)
    expect(screen.getByTestId(TEST_IDS.DAY_ACTION_SCREEN)).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.ERROR_STATE)).toBeNull()
    expect(screen.queryByText('Marcar como concluída')).toBeNull()
  })

  it('shows the error state with a working retry when the day cannot be loaded', async () => {
    server.use(mockTrpcError('plan.day', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<DayActionScreen />)
    await waitFor(() => expect(screen.getByTestId(TEST_IDS.ERROR_STATE)).toBeTruthy())
    server.use(mockQuery('plan.day', () => planDay()))
    await fireEvent.press(screen.getByTestId(TEST_IDS.ERROR_STATE_RETRY))
    await waitFor(() => expect(screen.getByText(ACTION)).toBeTruthy())
  })

  it('does not ask for a day number that is not valid and goes back from the retry', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ planId: PLAN_ID, dayNumber: 'abc' })
    const requested = jest.fn()
    server.use(
      mockQuery('plan.day', (input) => {
        requested(input)
        return planDay()
      }),
    )
    await renderWithProviders(<DayActionScreen />)
    expect(screen.getByTestId(TEST_IDS.ERROR_STATE)).toBeTruthy()
    await fireEvent.press(screen.getByTestId(TEST_IDS.ERROR_STATE_RETRY))
    expect(back).toHaveBeenCalledTimes(1)
    expect(requested).not.toHaveBeenCalled()
  })
})

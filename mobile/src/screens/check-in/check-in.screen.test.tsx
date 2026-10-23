import { API, CHECK_IN_STATES, TEST_IDS, TRPC_ERROR_CODES, toLocalDate } from '@clavis-via/shared'
import { mockMutation, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { HttpResponse, http } from 'msw/http'
import { BackHandler, Platform } from 'react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { CheckInScreen } from './check-in.screen'

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))

const SAVED_CHECK_IN = { id: 'check-in-1' }

// Every Date-based clock is frozen at the given instant; timers and microtasks keep running for real.
function freezeDateAt(instant: string) {
  jest.useFakeTimers({
    now: new Date(instant),
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

function continueButton() {
  return screen.getByTestId(TEST_IDS.CHECK_IN_SUBMIT)
}

function option(label: string) {
  return screen.getByRole('radio', { name: label })
}

describe('CheckInScreen', () => {
  const dismissTo = jest.fn()
  const canGoBack = jest.fn()

  beforeEach(() => {
    dismissTo.mockReset()
    canGoBack.mockReset()
    jest
      .mocked(useRouter)
      .mockReturnValue({ dismissTo, canGoBack } as unknown as ReturnType<typeof useRouter>)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders the copy, the eight options and a disabled Continuar', async () => {
    await renderWithProviders(<CheckInScreen />)
    for (const text of [
      'Como você está',
      'chegando hoje?',
      'Escolha o que mais representa',
      'seu momento agora.',
      'Pesada',
      'Ansiosa',
      'Desanimada',
      'Irritada',
      'Sensível',
      'Em paz',
      'Esperançosa',
      'Outro',
      'Continuar',
    ]) {
      expect(screen.getByText(text)).toBeTruthy()
    }
    expect(screen.getAllByRole('radio')).toHaveLength(8)
    expect(continueButton().props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    )
    expect(screen.queryByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT)).toBeNull()
  })

  it('renders exactly one tile per state of the API', async () => {
    await renderWithProviders(<CheckInScreen />)
    const rendered = new Set(
      screen
        .getAllByTestId(/^check-in-option-/)
        .map((tile) => tile.props.testID)
        .filter((testID) => testID !== TEST_IDS.CHECK_IN_OPTION_BORDER),
    )
    expect(rendered).toEqual(
      new Set(
        Object.values(CHECK_IN_STATES).map((state) => `${TEST_IDS.CHECK_IN_OPTION_PREFIX}${state}`),
      ),
    )
  })

  it('enables Continuar once an option is selected and keeps a single selection', async () => {
    await renderWithProviders(<CheckInScreen />)
    await fireEvent.press(option('Ansiosa'))
    expect(continueButton().props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    )
    expect(option('Ansiosa').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    )

    await fireEvent.press(option('Pesada'))
    expect(option('Pesada').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    )
    expect(option('Ansiosa').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    )
  })

  it('shows the text field for Outro and only enables Continuar with real text', async () => {
    await renderWithProviders(<CheckInScreen />)
    await fireEvent.press(option('Outro'))
    const field = screen.getByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT)
    expect(screen.getByText('Conte em poucas palavras')).toBeTruthy()
    expect(field.props.maxLength).toBe(280)
    expect(continueButton().props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    )

    await fireEvent.changeText(field, '   ')
    expect(continueButton().props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    )

    await fireEvent.changeText(field, 'cansada')
    expect(continueButton().props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    )
  })

  it('hides the text field when another option is selected', async () => {
    await renderWithProviders(<CheckInScreen />)
    await fireEvent.press(option('Outro'))
    await fireEvent.press(option('Em paz'))
    expect(screen.queryByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT)).toBeNull()
  })

  it('sends the state and the local date once (even when pressed twice) and goes home', async () => {
    freezeDateAt('2026-10-20T02:30:00Z')
    const received: unknown[] = []
    server.use(
      mockMutation('checkIn.create', (input) => {
        received.push(input)
        return SAVED_CHECK_IN
      }),
    )
    await renderWithProviders(<CheckInScreen />)
    await fireEvent.press(option('Ansiosa'))

    await act(async () => {
      fireEvent.press(continueButton())
      fireEvent.press(continueButton())
    })

    await waitFor(() => expect(dismissTo).toHaveBeenCalledWith(ROUTES.HOME))
    // 23:30 on the 19th in São Paulo is still the 19th.
    expect(received).toEqual([{ state: 'anxious', localDate: '2026-10-19' }])
    expect(dismissTo).toHaveBeenCalledTimes(1)
  })

  it('uses the local date at the moment of the press', async () => {
    const received: unknown[] = []
    server.use(
      mockMutation('checkIn.create', (input) => {
        received.push(input)
        return SAVED_CHECK_IN
      }),
    )
    await renderWithProviders(<CheckInScreen />)
    await fireEvent.press(option('Pesada'))
    freezeDateAt('2026-10-21T03:00:00Z')
    await fireEvent.press(continueButton())
    await waitFor(() => expect(dismissTo).toHaveBeenCalledWith(ROUTES.HOME))
    expect(received).toEqual([{ state: 'heavy', localDate: '2026-10-21' }])
    expect(toLocalDate(new Date())).toBe('2026-10-21')
  })

  it.each(['ios', 'android'] as const)(
    'sends the trimmed text for Outro on %s',
    async (platform) => {
      const operatingSystem = jest.replaceProperty(Platform, 'OS', platform)
      try {
        const received: unknown[] = []
        server.use(
          mockMutation('checkIn.create', (input) => {
            received.push(input)
            return SAVED_CHECK_IN
          }),
        )
        await renderWithProviders(<CheckInScreen />)
        await fireEvent.press(option('Outro'))
        await fireEvent.changeText(
          screen.getByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT),
          '  um dia estranho  ',
        )
        await fireEvent.press(continueButton())
        await waitFor(() => expect(dismissTo).toHaveBeenCalledWith(ROUTES.HOME))
        expect(received).toEqual([
          { state: 'other', otherText: 'um dia estranho', localDate: toLocalDate(new Date()) },
        ])
      } finally {
        operatingSystem.restore()
      }
    },
  )

  it('drops the text typed under Outro when another option is saved', async () => {
    const received: unknown[] = []
    server.use(
      mockMutation('checkIn.create', (input) => {
        received.push(input)
        return SAVED_CHECK_IN
      }),
    )
    await renderWithProviders(<CheckInScreen />)
    await fireEvent.press(option('Outro'))
    await fireEvent.changeText(screen.getByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT), 'texto')
    await fireEvent.press(option('Ansiosa'))
    await fireEvent.press(continueButton())
    await waitFor(() => expect(dismissTo).toHaveBeenCalledWith(ROUTES.HOME))
    expect(received).toEqual([{ state: 'anxious', localDate: toLocalDate(new Date()) }])
  })

  it('shows the error, keeps the selection and sends again when pressed again', async () => {
    server.use(mockTrpcError('checkIn.create', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<CheckInScreen />)
    await fireEvent.press(option('Ansiosa'))
    await fireEvent.press(continueButton())
    await waitFor(() => expect(screen.getByText('Não foi possível salvar agora.')).toBeTruthy())
    expect(dismissTo).not.toHaveBeenCalled()
    expect(option('Ansiosa').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    )

    let attempts = 0
    server.use(
      mockMutation('checkIn.create', () => {
        attempts += 1
        return SAVED_CHECK_IN
      }),
    )
    await fireEvent.press(continueButton())
    await waitFor(() => expect(dismissTo).toHaveBeenCalledWith(ROUTES.HOME))
    expect(attempts).toBe(1)
    expect(screen.queryByText('Não foi possível salvar agora.')).toBeNull()
  })

  it('shows a spinner inside the button while saving', async () => {
    let finishRequest: () => void = () => {}
    const pending = new Promise<void>((resolve) => {
      finishRequest = resolve
    })
    server.use(
      http.post(`${TEST_API_BASE_URL}${API.TRPC_PATH}/checkIn.create`, async () => {
        await pending
        return HttpResponse.json({ result: { data: SAVED_CHECK_IN } })
      }),
    )
    await renderWithProviders(<CheckInScreen />)
    await fireEvent.press(option('Pesada'))
    await fireEvent.press(continueButton())
    await waitFor(() =>
      expect(screen.getByTestId(`${TEST_IDS.CHECK_IN_SUBMIT}-spinner`)).toBeTruthy(),
    )
    finishRequest()
    await waitFor(() => expect(dismissTo).toHaveBeenCalledWith(ROUTES.HOME))
  })

  it('goes home with the close button without any request', async () => {
    const received: unknown[] = []
    server.use(
      mockMutation('checkIn.create', (input) => {
        received.push(input)
        return SAVED_CHECK_IN
      }),
    )
    await renderWithProviders(<CheckInScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar' }))
    expect(dismissTo).toHaveBeenCalledWith(ROUTES.HOME)
    expect(received).toEqual([])
  })

  describe('hardware back button', () => {
    let pressBack: () => boolean | null | undefined
    const remove = jest.fn()

    beforeEach(() => {
      remove.mockClear()
      jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, listener) => {
        pressBack = () => listener({ type: 'hardwareBackPress', timeStamp: 0 })
        return { remove }
      })
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('goes to Início instead of leaving the app when no screen is behind', async () => {
      canGoBack.mockReturnValue(false)
      await renderWithProviders(<CheckInScreen />)

      expect(pressBack()).toBe(true)
      expect(dismissTo).toHaveBeenCalledWith(ROUTES.HOME)
    })

    it('leaves the default back behavior when a screen is behind', async () => {
      canGoBack.mockReturnValue(true)
      await renderWithProviders(<CheckInScreen />)

      expect(pressBack()).toBe(false)
      expect(dismissTo).not.toHaveBeenCalled()
    })

    it('stops listening when the screen unmounts', async () => {
      const { unmount } = await renderWithProviders(<CheckInScreen />)

      await unmount()

      expect(remove).toHaveBeenCalledTimes(1)
    })
  })
})

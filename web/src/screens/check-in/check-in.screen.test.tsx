import { API, CHECK_IN_STATES, TEST_IDS, TRPC_ERROR_CODES, toLocalDate } from '@clavis-via/shared'
import { mockMutation, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { setViewportWidth } from '../../../tests/utils/viewport'
import { ROUTES } from '../../constants/route.constant'
import { CheckInScreen } from './check-in.screen'

const SAVED_CHECK_IN = { id: 'check-in-1' }

function continueButton() {
  return screen.getByTestId(TEST_IDS.CHECK_IN_SUBMIT)
}

function option(label: string) {
  return screen.getByRole('radio', { name: label })
}

function recordCreations() {
  const received: unknown[] = []
  server.use(
    mockMutation('checkIn.create', (input) => {
      received.push(input)
      return SAVED_CHECK_IN
    }),
  )
  return received
}

describe('CheckInScreen', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the copy, the eight options and a disabled Continuar', async () => {
    await renderWithProviders(<CheckInScreen />)

    for (const text of [
      'Como você está chegando hoje?',
      'Escolha o que mais representa seu momento agora.',
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
    expect(screen.getByRole('radiogroup', { name: 'Como você está chegando hoje?' })).toBeTruthy()
    expect((continueButton() as HTMLButtonElement).disabled).toBe(true)
    expect(screen.queryByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT)).toBeNull()
  })

  it('renders exactly one tile per state of the API', async () => {
    await renderWithProviders(<CheckInScreen />)

    const rendered = new Set(
      screen
        .getAllByRole('radio')
        .map((radio) => radio.closest('label')?.getAttribute('data-testid')),
    )

    expect(rendered).toEqual(
      new Set(
        Object.values(CHECK_IN_STATES).map((state) => `${TEST_IDS.CHECK_IN_OPTION_PREFIX}${state}`),
      ),
    )
  })

  it('enables Continuar once an option is selected and keeps a single selection', async () => {
    await renderWithProviders(<CheckInScreen />)

    fireEvent.click(option('Ansiosa'))
    await waitFor(() => expect((continueButton() as HTMLButtonElement).disabled).toBe(false))
    expect((option('Ansiosa') as HTMLInputElement).checked).toBe(true)

    fireEvent.click(option('Pesada'))
    expect((option('Pesada') as HTMLInputElement).checked).toBe(true)
    expect((option('Ansiosa') as HTMLInputElement).checked).toBe(false)
  })

  it('shows the text field for Outro and only enables Continuar with real text', async () => {
    await renderWithProviders(<CheckInScreen />)

    fireEvent.click(option('Outro'))
    const field = await screen.findByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT)
    expect(screen.getByText('Conte em poucas palavras')).toBeTruthy()
    expect(field.getAttribute('maxlength')).toBe('280')
    expect((continueButton() as HTMLButtonElement).disabled).toBe(true)

    fireEvent.change(field, { target: { value: '   ' } })
    await act(async () => {})
    expect((continueButton() as HTMLButtonElement).disabled).toBe(true)

    fireEvent.change(field, { target: { value: 'cansada' } })
    await waitFor(() => expect((continueButton() as HTMLButtonElement).disabled).toBe(false))
  })

  it('hides the text field when another option is selected', async () => {
    await renderWithProviders(<CheckInScreen />)

    fireEvent.click(option('Outro'))
    await screen.findByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT)
    fireEvent.click(option('Em paz'))

    await waitFor(() => expect(screen.queryByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT)).toBeNull())
  })

  it('sends the state and the local date once (even when pressed twice) and goes home', async () => {
    vi.useFakeTimers({ now: new Date('2026-10-20T02:30:00Z'), toFake: ['Date'] })
    const received = recordCreations()
    const { router } = await renderWithProviders(<CheckInScreen />)
    fireEvent.click(option('Ansiosa'))
    await waitFor(() => expect((continueButton() as HTMLButtonElement).disabled).toBe(false))

    await act(async () => {
      fireEvent.click(continueButton())
      fireEvent.click(continueButton())
    })

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
    // 23:30 on the 19th in São Paulo is still the 19th.
    expect(received).toEqual([{ state: 'anxious', localDate: '2026-10-19' }])
  })

  it('uses the local date at the moment of the press', async () => {
    const received = recordCreations()
    const { router } = await renderWithProviders(<CheckInScreen />)
    fireEvent.click(option('Pesada'))
    await waitFor(() => expect((continueButton() as HTMLButtonElement).disabled).toBe(false))

    vi.useFakeTimers({ now: new Date('2026-10-21T03:00:00Z'), toFake: ['Date'] })
    fireEvent.click(continueButton())

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
    expect(received).toEqual([{ state: 'heavy', localDate: '2026-10-21' }])
    expect(toLocalDate(new Date())).toBe('2026-10-21')
  })

  it('sends the trimmed text for Outro', async () => {
    const received = recordCreations()
    const { router } = await renderWithProviders(<CheckInScreen />)

    fireEvent.click(option('Outro'))
    fireEvent.change(await screen.findByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT), {
      target: { value: '  um dia estranho  ' },
    })
    await waitFor(() => expect((continueButton() as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(continueButton())

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
    expect(received).toEqual([
      { state: 'other', otherText: 'um dia estranho', localDate: toLocalDate(new Date()) },
    ])
  })

  it('drops the text typed under Outro when another option is saved', async () => {
    const received = recordCreations()
    const { router } = await renderWithProviders(<CheckInScreen />)

    fireEvent.click(option('Outro'))
    fireEvent.change(await screen.findByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT), {
      target: { value: 'texto' },
    })
    fireEvent.click(option('Ansiosa'))
    await waitFor(() => expect((continueButton() as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(continueButton())

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
    expect(received).toEqual([{ state: 'anxious', localDate: toLocalDate(new Date()) }])
  })

  it('shows the error, keeps the selection and sends again when pressed again', async () => {
    server.use(mockTrpcError('checkIn.create', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    const { router } = await renderWithProviders(<CheckInScreen />)
    fireEvent.click(option('Ansiosa'))
    await waitFor(() => expect((continueButton() as HTMLButtonElement).disabled).toBe(false))

    fireEvent.click(continueButton())

    expect(await screen.findByText('Não foi possível salvar agora.')).toBeTruthy()
    expect(router.state.location.pathname).not.toBe(ROUTES.HOME)
    expect((option('Ansiosa') as HTMLInputElement).checked).toBe(true)

    const received = recordCreations()
    await waitFor(() => expect((continueButton() as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(continueButton())

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
    expect(received).toHaveLength(1)
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
    const { router } = await renderWithProviders(<CheckInScreen />)
    fireEvent.click(option('Pesada'))
    await waitFor(() => expect((continueButton() as HTMLButtonElement).disabled).toBe(false))

    fireEvent.click(continueButton())

    expect(await screen.findByTestId(`${TEST_IDS.CHECK_IN_SUBMIT}-spinner`)).toBeTruthy()
    finishRequest()
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
  })

  it('goes home with the close button without any request', async () => {
    const received = recordCreations()
    const { router } = await renderWithProviders(<CheckInScreen />)

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
    expect(received).toEqual([])
  })
})

describe('CheckInScreen on a phone', () => {
  it('keeps the app layout: eight tiles, the Outro field, the error and the close button', async () => {
    setViewportWidth(390)
    server.use(mockTrpcError('checkIn.create', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    const { router } = await renderWithProviders(<CheckInScreen />)

    expect(screen.getAllByRole('radio')).toHaveLength(8)
    fireEvent.click(option('Outro'))
    fireEvent.change(await screen.findByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT), {
      target: { value: 'cansada' },
    })
    await waitFor(() => expect((continueButton() as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(continueButton())
    expect(await screen.findByTestId(TEST_IDS.CHECK_IN_ERROR)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
  })

  it('replaces the Check-in with Início after saving, so Back does not reopen the form', async () => {
    recordCreations()
    const { router } = await renderWithProviders(<CheckInScreen />)
    const navigate = vi.spyOn(router, 'navigate')
    fireEvent.click(option('Ansiosa'))
    await waitFor(() => expect((continueButton() as HTMLButtonElement).disabled).toBe(false))

    fireEvent.click(continueButton())

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
    expect(navigate).toHaveBeenCalledWith({ to: ROUTES.HOME, replace: true })
  })

  it('replaces the Check-in with Início on the X too', async () => {
    const { router } = await renderWithProviders(<CheckInScreen />)
    const navigate = vi.spyOn(router, 'navigate')

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
    expect(navigate).toHaveBeenCalledWith({ to: ROUTES.HOME, replace: true })
  })

  it('is a native form: Enter in the Outro field sends it once it is valid', async () => {
    const received = recordCreations()
    const { router } = await renderWithProviders(<CheckInScreen />)
    fireEvent.click(option('Outro'))
    const field = await screen.findByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT)
    const form = field.closest('form') as HTMLFormElement

    fireEvent.submit(form)
    await act(async () => {})
    expect(received).toHaveLength(0)

    fireEvent.change(field, { target: { value: 'cansada' } })
    await waitFor(() => expect((continueButton() as HTMLButtonElement).disabled).toBe(false))
    expect(continueButton().getAttribute('type')).toBe('submit')
    fireEvent.submit(form)

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.HOME))
    expect(received).toEqual([
      { state: 'other', otherText: 'cansada', localDate: toLocalDate(new Date()) },
    ])
  })
})

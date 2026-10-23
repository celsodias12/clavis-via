import { TEST_IDS, TRPC_ERROR_CODES } from '@clavis-via/shared'
import {
  mockMutation,
  mockQuery,
  mockTrpcError,
  server,
  TEST_API_BASE_URL,
} from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { setViewportWidth } from '../../../tests/utils/viewport'
import { DayActionScreen } from './day-action.screen'

vi.mock('sonner', () => ({ toast: vi.fn() }))

const PLAN_ID = 'learning-to-set-boundaries'
const ACTION_ROUTE = `/plan/${PLAN_ID}/day/1/action`
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

function renderAction(dayNumber = '1') {
  return renderWithProviders(<DayActionScreen planId={PLAN_ID} dayNumber={dayNumber} />, {
    route: ACTION_ROUTE,
  })
}

function completeButton() {
  return screen.getByTestId(TEST_IDS.DAY_ACTION_COMPLETE_BUTTON) as HTMLButtonElement
}

function reflectionField() {
  return screen.getByTestId(TEST_IDS.DAY_ACTION_REFLECTION) as HTMLTextAreaElement
}

describe('DayActionScreen', () => {
  beforeEach(() => {
    vi.mocked(toast).mockClear()
  })

  it('shows the action and the tip of the day of the design', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    await renderAction()

    await screen.findByText(ACTION)
    expect(screen.getByRole('heading', { name: 'Ação do dia' })).toBeTruthy()
    expect(screen.getByText('Dica da Thalita')).toBeTruthy()
    expect(screen.getByText(`“${TIP}”`)).toBeTruthy()
    expect(screen.getByText('Marcar como concluída')).toBeTruthy()
    expect(screen.getByText('Como foi para você?')).toBeTruthy()
    expect(reflectionField().placeholder).toBe('Escreva aqui sua reflexão...')
    expect(reflectionField().maxLength).toBe(1000)
    expect(reflectionField().tagName).toBe('TEXTAREA')
  })

  it('asks the API for the day of the route and goes back with the arrow', async () => {
    const requested = vi.fn()
    server.use(
      mockQuery('plan.day', (input) => {
        requested(input)
        return planDay()
      }),
    )
    const { router } = await renderAction()
    const back = vi.spyOn(router.history, 'back').mockImplementation(() => {})
    vi.spyOn(router.history, 'canGoBack').mockReturnValue(true)
    await waitFor(() => expect(requested).toHaveBeenCalledWith({ planId: PLAN_ID, dayNumber: 1 }))

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))

    expect(back).toHaveBeenCalledTimes(1)
  })

  it('goes to the day from the arrow on a direct visit', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    const { router } = await renderAction()
    vi.spyOn(router.history, 'canGoBack').mockReturnValue(false)

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))

    await waitFor(() => expect(router.state.location.pathname).toBe(`/plan/${PLAN_ID}/day/1`))
  })

  it('completes the day once with the reflection, shows the toast and replaces the page with the plan', async () => {
    let release = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const completed = vi.fn()
    server.use(
      mockQuery('plan.day', () => planDay()),
      http.post(`${TEST_API_BASE_URL}/trpc/plan.completeDay`, async ({ request }) => {
        completed(await request.json())
        await gate
        return HttpResponse.json({ result: { data: COMPLETION } })
      }),
    )
    const { router } = await renderAction()
    const replace = vi.spyOn(router, 'navigate')
    await screen.findByText(ACTION)
    fireEvent.change(reflectionField(), { target: { value: '  Respirei.  ' } })

    fireEvent.click(completeButton())
    fireEvent.click(completeButton())
    await waitFor(() => expect(completed).toHaveBeenCalledTimes(1))
    expect(
      screen.getByTestId(
        `${TEST_IDS.DAY_ACTION_COMPLETE_BUTTON}${TEST_IDS.PRIMARY_BUTTON_SPINNER_SUFFIX}`,
      ),
    ).toBeTruthy()
    expect(router.state.location.pathname).toBe(ACTION_ROUTE)

    await act(async () => release())

    await waitFor(() => expect(router.state.location.pathname).toBe(`/plan/${PLAN_ID}`))
    expect(replace).toHaveBeenCalledWith({
      to: '/plan/$planId',
      params: { planId: PLAN_ID },
      replace: true,
    })
    expect(completed).toHaveBeenCalledTimes(1)
    expect(completed).toHaveBeenCalledWith({
      planId: PLAN_ID,
      dayNumber: 1,
      reflection: 'Respirei.',
    })
    expect(toast).toHaveBeenCalledWith('Dia concluído.')
  })

  it('sends a blank reflection as undefined', async () => {
    const completed = vi.fn()
    server.use(
      mockQuery('plan.day', () => planDay()),
      mockMutation('plan.completeDay', (input) => {
        completed(input)
        return COMPLETION
      }),
    )
    const { router } = await renderAction()
    await screen.findByText(ACTION)
    fireEvent.change(reflectionField(), { target: { value: '   ' } })

    fireEvent.click(completeButton())

    await waitFor(() => expect(router.state.location.pathname).toBe(`/plan/${PLAN_ID}`))
    expect(completed).toHaveBeenCalledWith({ planId: PLAN_ID, dayNumber: 1 })
  })

  it('shows the field error for 1001 characters and sends nothing', async () => {
    const completed = vi.fn()
    server.use(
      mockQuery('plan.day', () => planDay()),
      mockMutation('plan.completeDay', (input) => {
        completed(input)
        return COMPLETION
      }),
    )
    const { router } = await renderAction()
    await screen.findByText(ACTION)
    fireEvent.change(reflectionField(), { target: { value: 'a'.repeat(1001) } })

    await screen.findByText('Escreva no máximo 1000 caracteres.')
    fireEvent.click(completeButton())

    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(completed).not.toHaveBeenCalled()
    expect(router.state.location.pathname).toBe(ACTION_ROUTE)
  })

  it('shows an already completed day as done, with the saved reflection read-only', async () => {
    server.use(
      mockQuery('plan.day', () =>
        planDay({
          completion: { reflection: 'Respirei.', completedAt: '2026-10-20T12:00:00.000Z' },
        }),
      ),
    )
    const { router } = await renderAction()

    await screen.findByText('Dia concluído')
    expect(screen.queryByText('Marcar como concluída')).toBeNull()
    expect(completeButton().disabled).toBe(true)
    expect(reflectionField().value).toBe('Respirei.')
    expect(reflectionField().readOnly).toBe(true)
    fireEvent.click(completeButton())
    expect(router.state.location.pathname).toBe(ACTION_ROUTE)
  })

  it('shows an empty read-only field for a completed day without reflection', async () => {
    server.use(
      mockQuery('plan.day', () =>
        planDay({ completion: { reflection: null, completedAt: '2026-10-20T12:00:00.000Z' } }),
      ),
    )
    await renderAction()

    await screen.findByText('Dia concluído')
    expect(reflectionField().value).toBe('')
    expect(reflectionField().readOnly).toBe(true)
  })

  it('keeps what was typed and says it could not save when the API fails', async () => {
    server.use(
      mockQuery('plan.day', () => planDay()),
      mockTrpcError('plan.completeDay', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500),
    )
    const { router } = await renderAction()
    await screen.findByText(ACTION)
    fireEvent.change(reflectionField(), { target: { value: 'Respirei.' } })

    fireEvent.click(completeButton())

    await screen.findByText('Não foi possível salvar agora.')
    expect(reflectionField().value).toBe('Respirei.')
    expect(router.state.location.pathname).toBe(ACTION_ROUTE)
    expect(toast).not.toHaveBeenCalled()
    expect(screen.getByTestId(TEST_IDS.DAY_ACTION_ERROR).getAttribute('aria-live')).toBe('polite')
  })

  it('shows skeletons while the day loads', async () => {
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/plan.day`, async () => {
        await new Promise(() => {})
        return HttpResponse.json({})
      }),
    )
    await renderAction()

    expect(screen.getByTestId(TEST_IDS.DAY_ACTION_SCREEN)).toBeTruthy()
    expect(screen.getAllByLabelText('Carregando').length).toBeGreaterThan(0)
    expect(screen.queryByTestId(TEST_IDS.ERROR_STATE)).toBeNull()
    expect(screen.queryByText('Marcar como concluída')).toBeNull()
  })

  it('shows the error state with a working retry when the day cannot be loaded', async () => {
    server.use(mockTrpcError('plan.day', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderAction()
    await screen.findByTestId(TEST_IDS.ERROR_STATE)

    server.use(mockQuery('plan.day', () => planDay()))
    fireEvent.click(screen.getByTestId(TEST_IDS.ERROR_STATE_RETRY))

    expect(await screen.findByText(ACTION)).toBeTruthy()
  })

  it('does not ask for a day number that is not valid and leaves the page from the retry', async () => {
    const requested = vi.fn()
    server.use(
      mockQuery('plan.day', (input) => {
        requested(input)
        return planDay()
      }),
    )
    const { router } = await renderAction('abc')
    const back = vi.spyOn(router.history, 'back').mockImplementation(() => {})
    vi.spyOn(router.history, 'canGoBack').mockReturnValue(true)

    expect(screen.getByTestId(TEST_IDS.ERROR_STATE)).toBeTruthy()
    fireEvent.click(screen.getByTestId(TEST_IDS.ERROR_STATE_RETRY))

    expect(back).toHaveBeenCalledTimes(1)
    expect(requested).not.toHaveBeenCalled()
  })

  it('follows the app on a phone (button, then reflection) and puts the field first on a wide page', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    setViewportWidth(390)
    await renderAction()
    await screen.findByText(ACTION)
    const precedes = (first: HTMLElement, second: HTMLElement) =>
      Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)

    expect(precedes(completeButton(), reflectionField())).toBe(true)

    setViewportWidth(1200)

    expect(precedes(reflectionField(), completeButton())).toBe(true)
    expect(reflectionField().closest('form')).toBe(completeButton().closest('form'))
  })
})

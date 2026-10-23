import { TEST_IDS, TRPC_ERROR_CODES } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { PlanDayScreen } from './plan-day.screen'

vi.mock('sonner', () => ({ toast: vi.fn() }))

const PLAN_ID = 'when-discouragement-weighs'
const DAY_ROUTE = `/plan/${PLAN_ID}/day/1`
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

// The press lock of the buttons is released a microtask after the click, so consecutive clicks wait for it.
async function click(element: HTMLElement) {
  await act(async () => {
    fireEvent.click(element)
  })
}

function renderDay(dayNumber = '1') {
  return renderWithProviders(<PlanDayScreen planId={PLAN_ID} dayNumber={dayNumber} />, {
    route: DAY_ROUTE,
  })
}

describe('PlanDayScreen', () => {
  beforeEach(() => {
    vi.mocked(toast).mockClear()
  })

  it('shows the header, the title, the video length and the message of today', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    await renderDay()

    await screen.findByText('Respirar e reconhecer')
    expect(screen.getByRole('heading', { name: 'Respirar e reconhecer' })).toBeTruthy()
    expect(screen.getByText('Dia 1 de 3')).toBeTruthy()
    expect(screen.getByText('2:18 min')).toBeTruthy()
    expect(screen.getByText('Mensagem de hoje')).toBeTruthy()
    expect(screen.getByText(MESSAGE)).toBeTruthy()
    for (const label of ['Conteúdo', 'Reflexão', 'Ação', 'Oração']) {
      expect(screen.getByText(label)).toBeTruthy()
    }
  })

  it('asks the API for the day of the route', async () => {
    const requested = vi.fn()
    server.use(
      mockQuery('plan.day', (input) => {
        requested(input)
        return planDay()
      }),
    )
    await renderDay()

    await waitFor(() => expect(requested).toHaveBeenCalledWith({ planId: PLAN_ID, dayNumber: 1 }))
    await screen.findByText(MESSAGE)
  })

  it('walks Conteúdo, Reflexão, Ação and Oração with Próximo and back with Anterior', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    await renderDay()
    await screen.findByText(MESSAGE)
    const previous = () => screen.getByTestId(TEST_IDS.DAY_PREVIOUS_BUTTON) as HTMLButtonElement
    const next = () => screen.getByTestId(TEST_IDS.DAY_NEXT_BUTTON) as HTMLButtonElement
    expect(previous().disabled).toBe(true)

    await click(next())
    expect(screen.getByText('O que pesa em você hoje?')).toBeTruthy()
    expect(screen.queryByText(MESSAGE)).toBeNull()
    expect(segment('reflection').getAttribute('aria-pressed')).toBe('true')

    await click(next())
    expect(screen.getByText('Pare por um minuto e respire fundo três vezes.')).toBeTruthy()

    await click(next())
    expect(screen.getByText('Senhor, me ensina a descansar em Ti.')).toBeTruthy()
    expect(next().disabled).toBe(true)
    await click(next())
    expect(screen.getByText('Senhor, me ensina a descansar em Ti.')).toBeTruthy()

    await click(previous())
    expect(screen.getByText('Pare por um minuto e respire fundo três vezes.')).toBeTruthy()
    await click(previous())
    await click(previous())
    expect(screen.getByText(MESSAGE)).toBeTruthy()
  })

  it('jumps to a segment when it is clicked and shows the action with its button', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    const { router } = await renderDay()
    await screen.findByText(MESSAGE)

    fireEvent.click(segment('action'))
    expect(screen.getByText('Pare por um minuto e respire fundo três vezes.')).toBeTruthy()
    expect(screen.getByText('Ir para a ação do dia')).toBeTruthy()

    fireEvent.click(screen.getByTestId(TEST_IDS.DAY_ACTION_BUTTON))
    await waitFor(() => expect(router.state.location.pathname).toBe(`${DAY_ROUTE}/action`))
  })

  it('does not show the action button in the other segments', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    await renderDay()
    await screen.findByText(MESSAGE)

    fireEvent.click(segment('prayer'))

    expect(screen.queryByTestId(TEST_IDS.DAY_ACTION_BUTTON)).toBeNull()
  })

  it('sends the video play and the three dots to the coming soon notice', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    await renderDay()
    await screen.findByText(MESSAGE)

    fireEvent.click(screen.getByTestId(TEST_IDS.VIDEO_PLAY))
    expect(toast).toHaveBeenCalledWith('Em breve')
    vi.mocked(toast).mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Mais opções' }))
    expect(toast).toHaveBeenCalledWith('Em breve')
  })

  it('goes back in the history from the header arrow', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    const { router } = await renderDay()
    const back = vi.spyOn(router.history, 'back').mockImplementation(() => {})
    vi.spyOn(router.history, 'canGoBack').mockReturnValue(true)

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))

    expect(back).toHaveBeenCalledTimes(1)
    await screen.findByText(MESSAGE)
  })

  it('goes to the plan from the header arrow on a direct visit', async () => {
    server.use(mockQuery('plan.day', () => planDay()))
    const { router } = await renderDay()
    vi.spyOn(router.history, 'canGoBack').mockReturnValue(false)

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))

    await waitFor(() => expect(router.state.location.pathname).toBe(`/plan/${PLAN_ID}`))
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
    await renderDay()

    expect(screen.getAllByLabelText('Carregando').length).toBeGreaterThan(0)
    expect(screen.queryByTestId(TEST_IDS.DAY_NEXT_BUTTON)).toBeNull()

    await act(async () => release())
    await screen.findByText('Respirar e reconhecer')
    expect(screen.queryAllByLabelText('Carregando')).toHaveLength(0)
  })

  it('shows the error state for a day number that is not valid, without a request', async () => {
    const requested = vi.fn()
    server.use(
      mockQuery('plan.day', (input) => {
        requested(input)
        return planDay()
      }),
    )
    const { router } = await renderDay('abc')
    vi.spyOn(router.history, 'canGoBack').mockReturnValue(false)

    expect(screen.getByText('Não foi possível carregar agora.')).toBeTruthy()
    expect(screen.queryAllByLabelText('Carregando')).toHaveLength(0)
    fireEvent.click(screen.getByText('Tentar de novo'))
    await waitFor(() => expect(router.state.location.pathname).toBe(`/plan/${PLAN_ID}`))
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(requested).not.toHaveBeenCalled()
  })

  it('shows the error state when the day does not exist and tries again on demand', async () => {
    server.use(mockTrpcError('plan.day', TRPC_ERROR_CODES.NOT_FOUND, 404))
    const { router } = await renderDay()
    const back = vi.spyOn(router.history, 'back').mockImplementation(() => {})
    await screen.findByText('Tentar de novo')
    expect(screen.queryByTestId(TEST_IDS.DAY_NEXT_BUTTON)).toBeNull()

    server.use(mockQuery('plan.day', () => planDay()))
    fireEvent.click(screen.getByText('Tentar de novo'))

    await screen.findByText('Respirar e reconhecer')
    expect(back).not.toHaveBeenCalled()
  })

  it('translates the labels to English', async () => {
    const { i18n } = await import('../../configs/i18n.config')
    await i18n.changeLanguage('en')
    server.use(mockQuery('plan.day', () => planDay()))
    await renderDay()

    await screen.findByText('Day 1 of 3')
    expect(screen.getByText("Today's message")).toBeTruthy()
    expect(screen.getByText('Next')).toBeTruthy()
    expect(screen.getByText('Previous')).toBeTruthy()
    await i18n.changeLanguage('pt-BR')
  })
})

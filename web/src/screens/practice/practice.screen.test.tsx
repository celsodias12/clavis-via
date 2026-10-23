import { TEST_IDS, TRPC_ERROR_CODES } from '@clavis-via/shared'
import { mockMutation, mockQuery, mockTrpcError, server } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { PracticeScreen } from './practice.screen'

const PRACTICE = {
  id: 'guided-breathing',
  title: 'Respiração guiada',
  durationSeconds: 180,
  description: 'Uma pausa para acalmar a mente, conectar com o seu corpo e voltar para o presente.',
}
const COMPLETION = {
  id: 'completion-1',
  practiceId: 'guided-breathing',
  localDate: '2026-10-20',
  completedAt: '2026-10-20T13:03:00.000Z',
}

const START = new Date(2026, 9, 20, 10, 0, 0)

// The data layer (MSW, React Query, the polling of waitFor) needs real timers, so the interval is faked only
// while the practice plays; the date is faked for the whole test.
function fakeTimers(faked: ('Date' | 'setInterval' | 'clearInterval')[], now: Date) {
  vi.useFakeTimers({ now, toFake: faked })
}

function startClock() {
  fakeTimers(['Date', 'setInterval', 'clearInterval'], new Date(Date.now()))
}

function stopClock() {
  fakeTimers(['Date'], new Date(Date.now()))
}

function advance(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds)
  })
}

function playButton() {
  return screen.getByTestId(TEST_IDS.PRACTICE_PLAY_BUTTON)
}

async function renderPractice() {
  return renderWithProviders(<PracticeScreen practiceId="guided-breathing" />, {
    route: '/practice/guided-breathing',
  })
}

async function renderLoaded() {
  const rendered = await renderPractice()
  await screen.findByText('Respiração guiada')
  return rendered
}

describe('PracticeScreen', () => {
  let play: ReturnType<typeof vi.spyOn>
  let pause: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    fakeTimers(['Date'], START)
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    server.use(mockQuery('practice.byId', () => PRACTICE))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows the practice with the clock at 0:00, the full length and the bar empty', async () => {
    await renderLoaded()

    expect(screen.getByRole('heading', { name: 'Prática de hoje' })).toBeTruthy()
    expect(screen.getByText('3 minutos')).toBeTruthy()
    expect(screen.getByText(PRACTICE.description)).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.PRACTICE_ELAPSED).textContent).toBe('0:00')
    expect(screen.getByTestId(TEST_IDS.PRACTICE_TOTAL).textContent).toBe('3:00')
    expect(
      screen
        .getByRole('progressbar', { name: 'Progresso da prática' })
        .getAttribute('aria-valuenow'),
    ).toBe('0')
    expect(screen.getByTestId(TEST_IDS.PROGRESS_BAR_FILL).style.width).toBe('0%')
    expect(screen.getByRole('button', { name: 'Reproduzir' })).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.PRACTICE_DONE)).toBeNull()
    expect(play).not.toHaveBeenCalled()
  })

  it('asks for the practice of the route', async () => {
    const requested = vi.fn()
    server.use(
      mockQuery('practice.byId', (input) => {
        requested(input)
        return PRACTICE
      }),
    )
    await renderLoaded()
    expect(requested).toHaveBeenCalledWith({ practiceId: 'guided-breathing' })
  })

  it('shows a skeleton, never a spinner, while the practice loads', async () => {
    await renderPractice()
    expect(screen.getAllByLabelText('Carregando').length).toBeGreaterThan(0)
    expect(screen.queryByTestId(TEST_IDS.PRACTICE_PLAY_BUTTON)).toBeNull()

    await screen.findByText('Respiração guiada')
    expect(screen.queryAllByLabelText('Carregando')).toHaveLength(0)
  })

  it('plays and pauses the clock and the sound with the big button', async () => {
    await renderLoaded()

    startClock()
    fireEvent.click(playButton())
    expect(play).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeTruthy()
    advance(65_000)
    expect(screen.getByTestId(TEST_IDS.PRACTICE_ELAPSED).textContent).toBe('1:05')
    expect(screen.getByTestId(TEST_IDS.PROGRESS_BAR_FILL).style.width).toBe(`${(65 / 180) * 100}%`)

    fireEvent.click(playButton())
    expect(pause).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Reproduzir' })).toBeTruthy()
    advance(30_000)
    expect(screen.getByTestId(TEST_IDS.PRACTICE_ELAPSED).textContent).toBe('1:05')
  })

  it('records the practice once when it finishes and shows the message', async () => {
    const completed = vi.fn()
    server.use(
      mockMutation('practice.complete', (input) => {
        completed(input)
        return COMPLETION
      }),
    )
    await renderLoaded()

    startClock()
    fireEvent.click(playButton())
    advance(180_000)
    stopClock()

    await screen.findByText('Prática registrada. Volte quando quiser.')
    expect(completed).toHaveBeenCalledTimes(1)
    expect(completed).toHaveBeenCalledWith({
      practiceId: 'guided-breathing',
      localDate: '2026-10-20',
    })
    expect(screen.getByTestId(TEST_IDS.PRACTICE_ELAPSED).textContent).toBe('3:00')
    expect(screen.getByTestId(TEST_IDS.PROGRESS_BAR_FILL).style.width).toBe('100%')
    expect(screen.getByRole('button', { name: 'Praticar de novo' })).toBeTruthy()

    await act(async () => vi.advanceTimersByTime(30_000))
    expect(completed).toHaveBeenCalledTimes(1)
  })

  it('goes again from 0:00 and records the next run too', async () => {
    const completed = vi.fn()
    server.use(
      mockMutation('practice.complete', (input) => {
        completed(input)
        return COMPLETION
      }),
    )
    await renderLoaded()
    startClock()
    fireEvent.click(playButton())
    advance(180_000)
    stopClock()
    await screen.findByTestId(TEST_IDS.PRACTICE_DONE)

    startClock()
    fireEvent.click(screen.getByRole('button', { name: 'Praticar de novo' }))

    expect(screen.getByTestId(TEST_IDS.PRACTICE_ELAPSED).textContent).toBe('0:00')
    expect(screen.queryByTestId(TEST_IDS.PRACTICE_DONE)).toBeNull()
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeTruthy()
    expect(play).toHaveBeenCalledTimes(2)

    advance(180_000)
    stopClock()
    await waitFor(() => expect(completed).toHaveBeenCalledTimes(2))
  })

  it('says the practice could not be recorded and records it again on retry', async () => {
    server.use(mockTrpcError('practice.complete', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderLoaded()
    startClock()
    fireEvent.click(playButton())
    advance(180_000)
    stopClock()
    await screen.findByText('Não foi possível registrar a prática agora.')
    expect(screen.queryByTestId(TEST_IDS.PRACTICE_DONE)).toBeNull()

    server.use(mockMutation('practice.complete', () => COMPLETION))
    fireEvent.click(screen.getByText('Tentar de novo'))

    await screen.findByText('Prática registrada. Volte quando quiser.')
    expect(screen.queryByText('Não foi possível registrar a prática agora.')).toBeNull()
  })

  it('shows the error state for an unknown practice and retries', async () => {
    server.use(mockTrpcError('practice.byId', TRPC_ERROR_CODES.NOT_FOUND, 404))
    await renderPractice()
    await screen.findByText('Não foi possível carregar agora.')
    expect(screen.queryByTestId(TEST_IDS.PRACTICE_PLAY_BUTTON)).toBeNull()

    server.use(mockQuery('practice.byId', () => PRACTICE))
    fireEvent.click(screen.getByText('Tentar de novo'))
    await screen.findByText('Respiração guiada')
  })

  it('closes with the X: back when there is a previous page, home on a direct visit', async () => {
    const { router } = await renderLoaded()
    const back = vi.spyOn(router.history, 'back').mockImplementation(() => {})
    const canGoBack = vi.spyOn(router.history, 'canGoBack').mockReturnValue(true)

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(back).toHaveBeenCalledTimes(1)

    canGoBack.mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/home'))
  })
})

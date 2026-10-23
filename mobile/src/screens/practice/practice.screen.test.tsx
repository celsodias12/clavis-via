import { TEST_IDS, TRPC_ERROR_CODES } from '@clavis-via/shared'
import { mockMutation, mockQuery, mockTrpcError, server } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { useAudioPlayer } from 'expo-audio'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { renderWithProviders } from '../../../tests/utils/render'
import { PracticeScreen } from './practice.screen'

jest.mock('expo-router', () => ({ useRouter: jest.fn(), useLocalSearchParams: jest.fn() }))
jest.mock('expo-audio', () => ({ useAudioPlayer: jest.fn() }))
jest.mock(
  'react-native-reanimated',
  () => require('../../../tests/utils/reanimated-mock').reanimatedModule,
)

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
const ALL_TIMERS = [
  'Date',
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
] as const

// The data layer (MSW, React Query, the polling of waitFor) needs a real setInterval, so the interval is
// faked only while the practice plays; the date is faked for the whole test.
function fakeTimers(faked: readonly string[], now: Date) {
  jest.useFakeTimers({ now, doNotFake: ALL_TIMERS.filter((timer) => !faked.includes(timer)) })
}

function startClock() {
  fakeTimers(['Date', 'setInterval', 'clearInterval'], new Date())
}

function stopClock() {
  fakeTimers(['Date'], new Date())
}

function playButton() {
  return screen.getByTestId(TEST_IDS.PRACTICE_PLAY_BUTTON)
}

describe('PracticeScreen', () => {
  const back = jest.fn()
  const player = { play: jest.fn(), pause: jest.fn(), loop: false }

  beforeEach(() => {
    fakeTimers(['Date'], START)
    back.mockClear()
    player.play.mockClear()
    player.pause.mockClear()
    jest
      .mocked(useAudioPlayer)
      .mockReturnValue(player as unknown as ReturnType<typeof useAudioPlayer>)
    jest.mocked(useRouter).mockReturnValue({ back } as unknown as ReturnType<typeof useRouter>)
    jest.mocked(useLocalSearchParams).mockReturnValue({ practiceId: 'guided-breathing' })
    server.use(mockQuery('practice.byId', () => PRACTICE))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  async function renderLoaded() {
    await renderWithProviders(<PracticeScreen />)
    await waitFor(() => expect(screen.getByText('Respiração guiada')).toBeTruthy())
  }

  it('shows the practice of the design with the clock at 0:00 and the full length', async () => {
    await renderLoaded()

    expect(screen.getByText('Prática de hoje')).toBeTruthy()
    expect(screen.getByText('3 minutos')).toBeTruthy()
    expect(screen.getByText(PRACTICE.description)).toBeTruthy()
    expect(screen.getByText('0:00')).toBeTruthy()
    expect(screen.getByText('3:00')).toBeTruthy()
    expect(screen.getByLabelText('Reproduzir')).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.PRACTICE_DONE)).toBeNull()
  })

  it('asks for the practice of the route', async () => {
    const requested = jest.fn()
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
    await renderWithProviders(<PracticeScreen />)
    expect(screen.getAllByLabelText('Carregando').length).toBeGreaterThan(0)
    expect(JSON.stringify(screen.toJSON())).not.toContain('"ActivityIndicator"')
    await waitFor(() => expect(screen.getByText('Respiração guiada')).toBeTruthy())
    expect(screen.queryAllByLabelText('Carregando')).toHaveLength(0)
  })

  it('plays and pauses the clock and the sound with the big button', async () => {
    await renderLoaded()

    startClock()
    await fireEvent.press(playButton())
    expect(player.play).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Pausar')).toBeTruthy()
    await act(async () => jest.advanceTimersByTime(65_000))
    expect(screen.getByText('1:05')).toBeTruthy()

    await fireEvent.press(playButton())
    expect(player.pause).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Reproduzir')).toBeTruthy()
    await act(async () => jest.advanceTimersByTime(30_000))
    expect(screen.getByText('1:05')).toBeTruthy()
  })

  it('records the practice once when it finishes and shows the message', async () => {
    const completed = jest.fn()
    server.use(
      mockMutation('practice.complete', (input) => {
        completed(input)
        return COMPLETION
      }),
    )
    await renderLoaded()

    startClock()
    await fireEvent.press(playButton())
    await act(async () => jest.advanceTimersByTime(180_000))
    stopClock()

    await waitFor(() =>
      expect(screen.getByText('Prática registrada. Volte quando quiser.')).toBeTruthy(),
    )
    expect(completed).toHaveBeenCalledTimes(1)
    expect(completed).toHaveBeenCalledWith({
      practiceId: 'guided-breathing',
      localDate: '2026-10-20',
    })
    expect(screen.getByTestId(TEST_IDS.PRACTICE_ELAPSED).props.children).toBe('3:00')
    expect(screen.getByLabelText('Praticar de novo')).toBeTruthy()

    await act(async () => jest.advanceTimersByTime(30_000))
    expect(completed).toHaveBeenCalledTimes(1)
  })

  it('goes again from 0:00 and records the next run too', async () => {
    const completed = jest.fn()
    server.use(
      mockMutation('practice.complete', (input) => {
        completed(input)
        return COMPLETION
      }),
    )
    await renderLoaded()
    startClock()
    await fireEvent.press(playButton())
    await act(async () => jest.advanceTimersByTime(180_000))
    stopClock()
    await waitFor(() => expect(screen.getByTestId(TEST_IDS.PRACTICE_DONE)).toBeTruthy())

    startClock()
    await fireEvent.press(screen.getByLabelText('Praticar de novo'))

    expect(screen.getByText('0:00')).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.PRACTICE_DONE)).toBeNull()
    expect(screen.getByLabelText('Pausar')).toBeTruthy()
    expect(player.play).toHaveBeenCalledTimes(2)

    await act(async () => jest.advanceTimersByTime(180_000))
    stopClock()
    await waitFor(() => expect(completed).toHaveBeenCalledTimes(2))
  })

  it('says the practice could not be recorded and records it again on retry', async () => {
    server.use(mockTrpcError('practice.complete', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderLoaded()
    startClock()
    await fireEvent.press(playButton())
    await act(async () => jest.advanceTimersByTime(180_000))
    stopClock()
    await waitFor(() =>
      expect(screen.getByText('Não foi possível registrar a prática agora.')).toBeTruthy(),
    )
    expect(screen.queryByTestId(TEST_IDS.PRACTICE_DONE)).toBeNull()

    server.use(mockMutation('practice.complete', () => COMPLETION))
    await fireEvent.press(screen.getByText('Tentar de novo'))

    await waitFor(() =>
      expect(screen.getByText('Prática registrada. Volte quando quiser.')).toBeTruthy(),
    )
    expect(screen.queryByText('Não foi possível registrar a prática agora.')).toBeNull()
  })

  it('shows the error state for an unknown practice and retries', async () => {
    server.use(mockTrpcError('practice.byId', TRPC_ERROR_CODES.NOT_FOUND, 404))
    await renderWithProviders(<PracticeScreen />)
    await waitFor(() => expect(screen.getByText('Não foi possível carregar agora.')).toBeTruthy())
    expect(screen.queryByTestId(TEST_IDS.PRACTICE_PLAY_BUTTON)).toBeNull()

    server.use(mockQuery('practice.byId', () => PRACTICE))
    await fireEvent.press(screen.getByText('Tentar de novo'))
    await waitFor(() => expect(screen.getByText('Respiração guiada')).toBeTruthy())
  })

  it('closes with the X', async () => {
    await renderLoaded()

    await fireEvent.press(screen.getByRole('button', { name: 'Fechar' }))

    expect(back).toHaveBeenCalledTimes(1)
  })
})

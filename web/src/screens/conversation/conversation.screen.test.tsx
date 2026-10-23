import { TEST_IDS, TRPC_ERROR_CODES, toLocalDate } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { format } from 'date-fns'
import { HttpResponse, http } from 'msw/http'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { clerkMock } from '../../../tests/utils/clerk-mock'
import { renderWithProviders } from '../../../tests/utils/render'
import { ConversationScreen } from './conversation.screen'

vi.mock('sonner', async (importOriginal) => ({
  ...(await importOriginal<typeof import('sonner')>()),
  toast: vi.fn(),
}))

const SEND_URL = `${TEST_API_BASE_URL}/trpc/conversation.send`
const LOCAL_DATE = toLocalDate(new Date())

const STORED_USER = {
  id: 'message-1',
  role: 'user',
  text: 'Oi, tudo bem?',
  createdAt: '2026-10-20T12:41:00.000Z',
}
const STORED_ASSISTANT = {
  id: 'message-2',
  role: 'assistant',
  text: 'Estou aqui para ouvir.',
  createdAt: '2026-10-20T12:41:02.000Z',
}

function signInAs(firstName: string | null) {
  clerkMock.user = { firstName, hasImage: false, imageUrl: '' }
}

// What the server has stored: the list handler reads it and the send handlers append to it, like the real API.
let stored: unknown[] = []

function store(text: string) {
  const result = {
    userMessage: { ...STORED_USER, text },
    assistantMessage: STORED_ASSISTANT,
  }
  stored = [...stored, result.userMessage, result.assistantMessage]
  return result
}

// A send handler that answers when the test releases it, so the pending state can be observed.
function holdSend(payloads: unknown[]) {
  let release: () => void = () => {}
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  server.use(
    http.post(SEND_URL, async ({ request }) => {
      const payload = (await request.json()) as { text: string }
      payloads.push(payload)
      await gate
      return HttpResponse.json({ result: { data: store(payload.text) } })
    }),
  )
  return release
}

function answerSend(payloads: unknown[]) {
  server.use(
    http.post(SEND_URL, async ({ request }) => {
      const payload = (await request.json()) as { text: string }
      payloads.push(payload)
      return HttpResponse.json({ result: { data: store(payload.text) } })
    }),
  )
}

function input() {
  return screen.getByTestId(TEST_IDS.CONVERSATION_INPUT) as HTMLTextAreaElement
}

function sendButton() {
  return screen.getByTestId(TEST_IDS.CONVERSATION_SEND) as HTMLButtonElement
}

function quickReply(intent: string) {
  return screen.getByTestId(`${TEST_IDS.CONVERSATION_QUICK_REPLY_PREFIX}${intent}`)
}

async function typeText(text: string) {
  fireEvent.change(input(), { target: { value: text } })
  await waitFor(() => expect(sendButton().disabled).toBe(false))
}

beforeEach(() => {
  signInAs('Ana')
  stored = []
  server.use(mockQuery('conversation.list', () => stored))
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('ConversationScreen', () => {
  it('greets the person by name and offers the four quick replies', async () => {
    // The greeting time belongs to this render; a real minute rollover must not change the assertion.
    vi.useFakeTimers({ now: new Date(2026, 9, 20, 9, 41), toFake: ['Date'] })
    await renderWithProviders(<ConversationScreen />)

    expect(screen.getByRole('heading', { name: 'Conversa' })).toBeTruthy()
    expect(
      screen.getByText('Oi, Ana. Eu estou aqui com você. Como você está se sentindo hoje?'),
    ).toBeTruthy()
    await waitFor(() => expect(screen.getByText('Quero conversar')).toBeTruthy())
    expect(screen.getByText('Preciso de uma direção')).toBeTruthy()
    expect(screen.getByText('Quero fazer uma prática')).toBeTruthy()
    expect(screen.getByText('Quero um momento com Deus')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.CONVERSATION_TIME).textContent).toBe(
      format(new Date(), 'HH:mm'),
    )
    expect(screen.getByRole('img', { name: 'Assistente CLAVIS' })).toBeTruthy()
  })

  it('greets without a name when the person has none', async () => {
    signInAs(null)
    await renderWithProviders(<ConversationScreen />)

    expect(
      screen.getByText('Oi. Eu estou aqui com você. Como você está se sentindo hoje?'),
    ).toBeTruthy()
  })

  it('shows the simulated replies notice and the disclaimer of the design', async () => {
    await renderWithProviders(<ConversationScreen />)

    expect(screen.getByTestId(TEST_IDS.CONVERSATION_SIMULATED_NOTICE).textContent).toBe(
      'Respostas simuladas nesta versão de demonstração.',
    )
    expect(screen.getByTestId(TEST_IDS.CONVERSATION_DISCLAIMER).textContent).toBe(
      'Respostas baseadas no universo CLAVIS.\nEste não é um serviço de tratamento médico ou psicológico.',
    )
    expect(input().placeholder).toBe('Escreva aqui o que você está sentindo...')
  })

  it('shows a skeleton while the stored messages load, without the quick replies', async () => {
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/conversation.list`, async () => new Promise(() => {})),
    )
    await renderWithProviders(<ConversationScreen />)

    expect(screen.getByTestId(TEST_IDS.CONVERSATION_SKELETON)).toBeTruthy()
    expect(screen.queryByTestId(`${TEST_IDS.CONVERSATION_QUICK_REPLY_PREFIX}talk`)).toBeNull()
  })

  it('shows the error state when the stored messages fail to load and retries', async () => {
    let attempts = 0
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/conversation.list`, () => {
        attempts += 1
        return attempts === 1
          ? HttpResponse.json(
              {
                error: {
                  message: 'x',
                  code: -32603,
                  data: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 },
                },
              },
              { status: 500 },
            )
          : HttpResponse.json({ result: { data: [] } })
      }),
    )
    await renderWithProviders(<ConversationScreen />)
    await waitFor(() => expect(screen.getByTestId(TEST_IDS.ERROR_STATE)).toBeTruthy())
    expect(screen.queryByTestId(`${TEST_IDS.CONVERSATION_QUICK_REPLY_PREFIX}talk`)).toBeNull()

    fireEvent.click(screen.getByTestId(TEST_IDS.ERROR_STATE_RETRY))

    await waitFor(() => expect(screen.getByText('Quero conversar')).toBeTruthy())
  })

  it('sends the quick reply once with its intent, shows typing, then the reply, and drops the quick replies', async () => {
    const payloads: unknown[] = []
    const release = holdSend(payloads)
    await renderWithProviders(<ConversationScreen />)
    await waitFor(() => expect(screen.getByText('Preciso de uma direção')).toBeTruthy())

    fireEvent.click(quickReply('direction'))

    await waitFor(() =>
      expect(screen.getByTestId(TEST_IDS.CONVERSATION_TYPING).textContent).toBe('digitando…'),
    )
    expect(screen.getByTestId(`${TEST_IDS.CONVERSATION_MESSAGE_PREFIX}user`).textContent).toBe(
      'Preciso de uma direção',
    )
    release()
    await waitFor(() => expect(screen.getByText('Estou aqui para ouvir.')).toBeTruthy())
    expect(screen.queryByTestId(TEST_IDS.CONVERSATION_TYPING)).toBeNull()
    expect(screen.queryByTestId(`${TEST_IDS.CONVERSATION_QUICK_REPLY_PREFIX}direction`)).toBeNull()
    expect(payloads).toEqual([
      { text: 'Preciso de uma direção', localDate: LOCAL_DATE, intent: 'direction' },
    ])
  })

  it('sends once when a quick reply is clicked twice before the screen re-renders', async () => {
    const payloads: unknown[] = []
    const release = holdSend(payloads)
    await renderWithProviders(<ConversationScreen />)
    await waitFor(() => expect(screen.getByText('Preciso de uma direção')).toBeTruthy())
    const pill = quickReply('direction')

    await act(async () => {
      fireEvent.click(pill)
      fireEvent.click(pill)
    })

    release()
    await waitFor(() => expect(screen.getByText('Estou aqui para ouvir.')).toBeTruthy())
    expect(payloads).toHaveLength(1)
  })

  it('keeps the send button disabled while the field is blank and sends the trimmed text', async () => {
    const payloads: unknown[] = []
    answerSend(payloads)
    await renderWithProviders(<ConversationScreen />)
    expect(sendButton().disabled).toBe(true)

    fireEvent.change(input(), { target: { value: '   ' } })
    expect(sendButton().disabled).toBe(true)

    await typeText('  Estou ansiosa  ')
    fireEvent.click(sendButton())

    await waitFor(() => expect(screen.getByText('Estou aqui para ouvir.')).toBeTruthy())
    expect(payloads).toEqual([{ text: 'Estou ansiosa', localDate: LOCAL_DATE }])
    await waitFor(() => expect(input().value).toBe(''))
    await waitFor(() => expect(sendButton().disabled).toBe(true))
  })

  it('sends with Enter and keeps Shift+Enter for a new line', async () => {
    const payloads: unknown[] = []
    answerSend(payloads)
    await renderWithProviders(<ConversationScreen />)
    await typeText('Oi')

    fireEvent.keyDown(input(), { key: 'Enter', shiftKey: true })
    expect(payloads).toHaveLength(0)
    fireEvent.keyDown(input(), { key: 'Enter' })

    await waitFor(() => expect(screen.getByText('Estou aqui para ouvir.')).toBeTruthy())
    expect(payloads).toEqual([{ text: 'Oi', localDate: LOCAL_DATE }])
  })

  it('does not clear what the person typed while the message was on its way', async () => {
    const payloads: unknown[] = []
    const release = holdSend(payloads)
    await renderWithProviders(<ConversationScreen />)
    await typeText('primeira')
    fireEvent.click(sendButton())
    await waitFor(() => expect(screen.getByTestId(TEST_IDS.CONVERSATION_SEND_SPINNER)).toBeTruthy())

    fireEvent.change(input(), { target: { value: 'segunda' } })
    release()

    await waitFor(() => expect(screen.getByText('Estou aqui para ouvir.')).toBeTruthy())
    await waitFor(() => expect(input().value).toBe('segunda'))
  })

  it('renders the stored messages on mount, with the time of the first one', async () => {
    stored = [STORED_USER, STORED_ASSISTANT]
    await renderWithProviders(<ConversationScreen />)

    await waitFor(() => expect(screen.getByText('Oi, tudo bem?')).toBeTruthy())
    expect(screen.getByText('Estou aqui para ouvir.')).toBeTruthy()
    expect(screen.queryByTestId(`${TEST_IDS.CONVERSATION_QUICK_REPLY_PREFIX}talk`)).toBeNull()
    // The messages are a polite live region, so a new reply is announced.
    const log = screen.getByRole('log', { name: 'Conversa' })
    expect(log.contains(screen.getByText('Estou aqui para ouvir.'))).toBe(true)
    expect(screen.getByTestId(TEST_IDS.CONVERSATION_TIME).textContent).toBe(
      format(new Date(STORED_USER.createdAt), 'HH:mm'),
    )
  })

  it('shows the error, keeps the text and resends the same text with Tentar de novo', async () => {
    server.use(mockTrpcError('conversation.send', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<ConversationScreen />)
    await typeText('Oi')
    fireEvent.click(sendButton())

    await waitFor(() => expect(screen.getByText('Não foi possível enviar agora.')).toBeTruthy())
    expect(input().value).toBe('Oi')
    expect(screen.queryByTestId(`${TEST_IDS.CONVERSATION_MESSAGE_PREFIX}user`)).toBeNull()

    const payloads: unknown[] = []
    answerSend(payloads)
    fireEvent.click(screen.getByTestId(TEST_IDS.CONVERSATION_RETRY))

    await waitFor(() => expect(screen.getByText('Estou aqui para ouvir.')).toBeTruthy())
    expect(payloads).toEqual([{ text: 'Oi', localDate: LOCAL_DATE }])
    expect(screen.queryByText('Não foi possível enviar agora.')).toBeNull()
    await waitFor(() => expect(input().value).toBe(''))
  })

  it('resends a failed quick reply with its intent', async () => {
    server.use(mockTrpcError('conversation.send', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<ConversationScreen />)
    await waitFor(() => expect(screen.getByText('Quero conversar')).toBeTruthy())
    fireEvent.click(quickReply('talk'))
    await waitFor(() => expect(screen.getByText('Não foi possível enviar agora.')).toBeTruthy())
    expect(screen.getByText('Quero conversar')).toBeTruthy()

    const payloads: unknown[] = []
    answerSend(payloads)
    fireEvent.click(screen.getByTestId(TEST_IDS.CONVERSATION_RETRY))

    await waitFor(() => expect(screen.getByText('Estou aqui para ouvir.')).toBeTruthy())
    expect(payloads).toEqual([{ text: 'Quero conversar', localDate: LOCAL_DATE, intent: 'talk' }])
  })

  it('shows the daily limit message, without a retry, on TOO_MANY_REQUESTS', async () => {
    server.use(mockTrpcError('conversation.send', TRPC_ERROR_CODES.TOO_MANY_REQUESTS, 429))
    await renderWithProviders(<ConversationScreen />)
    await typeText('Oi')
    fireEvent.click(sendButton())

    await waitFor(() =>
      expect(
        screen.getByText('Você chegou ao limite de mensagens por agora. Tente de novo mais tarde.'),
      ).toBeTruthy(),
    )
    expect(screen.queryByTestId(TEST_IDS.CONVERSATION_RETRY)).toBeNull()
  })

  it('follows the newest message when one is added, and leaves the greeting alone before', async () => {
    const scrollHeight = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(480)
    const scrollTop = vi
      .spyOn(HTMLElement.prototype, 'scrollTop', 'set')
      .mockImplementation(() => {})
    const payloads: unknown[] = []
    answerSend(payloads)
    await renderWithProviders(<ConversationScreen />)
    await waitFor(() => expect(screen.getByText('Quero conversar')).toBeTruthy())
    expect(scrollTop).not.toHaveBeenCalled()

    fireEvent.click(quickReply('talk'))

    await waitFor(() => expect(scrollTop).toHaveBeenCalledWith(480))
    expect(scrollHeight).toHaveBeenCalled()
  })

  it('shows the coming soon toast from the history button', async () => {
    await renderWithProviders(<ConversationScreen />)

    fireEvent.click(screen.getByText('Histórico'))

    expect(toast).toHaveBeenCalledWith('Em breve')
  })
})

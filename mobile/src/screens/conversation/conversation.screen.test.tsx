import { TEST_IDS, TRPC_ERROR_CODES, toLocalDate } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { useUser } from '@clerk/expo'
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { format } from 'date-fns'
import { HttpResponse, http } from 'msw/http'
import { Platform, ToastAndroid } from 'react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { ConversationScreen } from './conversation.screen'

jest.mock('@clerk/expo', () => require('../../../tests/utils/clerk-mock').clerkModule)
jest.mock(
  'react-native-reanimated',
  () => require('../../../tests/utils/reanimated-mock').reanimatedModule,
)

// The real ScrollView of the Jest setup has no scrollToEnd; this one reports the calls, hands out the callback
// the screen registered for content size changes and can leave its ref unattached.
const mockScrollToEnd = jest.fn()
let mockAttachReference = true
let mockContentSizeChange: (() => void) | undefined
jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
  const { forwardRef, useImperativeHandle } = require('react')
  const { View } = require('react-native')
  const MockScrollView = forwardRef(function MockScrollView(
    {
      children,
      contentContainerStyle,
      onContentSizeChange,
    }: { children: unknown; contentContainerStyle: unknown; onContentSizeChange: () => void },
    reference: unknown,
  ) {
    mockContentSizeChange = onContentSizeChange
    useImperativeHandle(reference, () =>
      mockAttachReference ? { scrollToEnd: mockScrollToEnd } : null,
    )
    return <View style={contentContainerStyle}>{children}</View>
  })
  return { __esModule: true, default: MockScrollView }
})

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

function mockUser(firstName: string | null) {
  jest.mocked(useUser).mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: { firstName, hasImage: false, imageUrl: '' },
  } as unknown as ReturnType<typeof useUser>)
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

beforeEach(() => {
  mockUser('Ana')
  mockAttachReference = true
  mockContentSizeChange = undefined
  mockScrollToEnd.mockClear()
  stored = []
  server.use(mockQuery('conversation.list', () => stored))
})

afterEach(() => jest.useRealTimers())

describe('ConversationScreen', () => {
  it('greets the person by name and offers the four quick replies', async () => {
    // Freeze only Date: network mocks and React Query still need real timers and microtasks.
    jest.useFakeTimers({
      now: new Date(2026, 9, 20, 9, 41),
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
    await renderWithProviders(<ConversationScreen />)
    expect(screen.getByText('Conversa')).toBeTruthy()
    expect(
      screen.getByText('Oi, Ana. Eu estou aqui com você. Como você está se sentindo hoje?'),
    ).toBeTruthy()
    await waitFor(() => expect(screen.getByText('Quero conversar')).toBeTruthy())
    expect(screen.getByText('Preciso de uma direção')).toBeTruthy()
    expect(screen.getByText('Quero fazer uma prática')).toBeTruthy()
    expect(screen.getByText('Quero um momento com Deus')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.CONVERSATION_TIME)).toHaveTextContent(
      format(new Date(), 'HH:mm'),
    )
  })

  it('greets without a name when the person has none', async () => {
    mockUser(null)
    await renderWithProviders(<ConversationScreen />)
    expect(
      screen.getByText('Oi. Eu estou aqui com você. Como você está se sentindo hoje?'),
    ).toBeTruthy()
  })

  it('shows the simulated replies notice and the disclaimer of the design', async () => {
    await renderWithProviders(<ConversationScreen />)
    expect(screen.getByText('Respostas simuladas nesta versão de demonstração.')).toBeTruthy()
    expect(
      screen.getByText(
        'Respostas baseadas no universo CLAVIS.\nEste não é um serviço de tratamento médico ou psicológico.',
      ),
    ).toBeTruthy()
    expect(screen.getByPlaceholderText('Escreva aqui o que você está sentindo...')).toBeTruthy()
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

    await fireEvent.press(screen.getByTestId(TEST_IDS.ERROR_STATE_RETRY))

    await waitFor(() => expect(screen.getByText('Quero conversar')).toBeTruthy())
  })

  it('sends the quick reply once with its intent, shows typing, then the reply, and drops the quick replies', async () => {
    const payloads: unknown[] = []
    const release = holdSend(payloads)
    await renderWithProviders(<ConversationScreen />)
    await waitFor(() => expect(screen.getByText('Preciso de uma direção')).toBeTruthy())

    await fireEvent.press(
      screen.getByTestId(`${TEST_IDS.CONVERSATION_QUICK_REPLY_PREFIX}direction`),
    )

    await waitFor(() =>
      expect(screen.getByTestId(TEST_IDS.CONVERSATION_TYPING)).toHaveTextContent('digitando…'),
    )
    expect(screen.getByTestId(`${TEST_IDS.CONVERSATION_MESSAGE_PREFIX}user`)).toHaveTextContent(
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

  it('sends once when a quick reply is pressed twice before the screen re-renders', async () => {
    const payloads: unknown[] = []
    const release = holdSend(payloads)
    await renderWithProviders(<ConversationScreen />)
    await waitFor(() => expect(screen.getByText('Preciso de uma direção')).toBeTruthy())
    const pill = screen.getByTestId(`${TEST_IDS.CONVERSATION_QUICK_REPLY_PREFIX}direction`)

    await act(async () => {
      fireEvent.press(pill)
      fireEvent.press(pill)
    })

    release()
    await waitFor(() => expect(screen.getByText('Estou aqui para ouvir.')).toBeTruthy())
    expect(payloads).toHaveLength(1)
  })

  it.each(['ios', 'android'] as const)(
    'keeps the send button disabled while the field is blank and sends the trimmed text on %s',
    async (platform) => {
      const operatingSystem = jest.replaceProperty(Platform, 'OS', platform)
      try {
        const payloads: unknown[] = []
        answerSend(payloads)
        await renderWithProviders(<ConversationScreen />)
        const send = screen.getByTestId(TEST_IDS.CONVERSATION_SEND)
        expect(send).toBeDisabled()

        await fireEvent.changeText(screen.getByTestId(TEST_IDS.CONVERSATION_INPUT), '   ')
        expect(send).toBeDisabled()

        await fireEvent.changeText(
          screen.getByTestId(TEST_IDS.CONVERSATION_INPUT),
          '  Estou ansiosa  ',
        )
        await waitFor(() => expect(send).toBeEnabled())
        await fireEvent.press(send)

        await waitFor(() => expect(screen.getByText('Estou aqui para ouvir.')).toBeTruthy())
        expect(payloads).toEqual([{ text: 'Estou ansiosa', localDate: LOCAL_DATE }])
        await waitFor(() => {
          expect(screen.getByTestId(TEST_IDS.CONVERSATION_INPUT).props.value).toBe('')
          expect(send).toBeDisabled()
        })
      } finally {
        operatingSystem.restore()
      }
    },
  )

  it('does not clear what the person typed while the message was on its way', async () => {
    const payloads: unknown[] = []
    const release = holdSend(payloads)
    await renderWithProviders(<ConversationScreen />)
    const input = screen.getByTestId(TEST_IDS.CONVERSATION_INPUT)
    await fireEvent.changeText(input, 'primeira')
    await waitFor(() => expect(screen.getByTestId(TEST_IDS.CONVERSATION_SEND)).toBeEnabled())
    await fireEvent.press(screen.getByTestId(TEST_IDS.CONVERSATION_SEND))
    await waitFor(() => expect(screen.getByTestId(TEST_IDS.CONVERSATION_SEND_SPINNER)).toBeTruthy())

    await fireEvent.changeText(input, 'segunda')
    release()

    await waitFor(() => expect(screen.getByText('Estou aqui para ouvir.')).toBeTruthy())
    expect(screen.getByTestId(TEST_IDS.CONVERSATION_INPUT).props.value).toBe('segunda')
  })

  it('renders the stored messages on mount, with the time of the first one', async () => {
    stored = [STORED_USER, STORED_ASSISTANT]
    await renderWithProviders(<ConversationScreen />)
    await waitFor(() => expect(screen.getByText('Oi, tudo bem?')).toBeTruthy())
    expect(screen.getByText('Estou aqui para ouvir.')).toBeTruthy()
    expect(screen.queryByTestId(`${TEST_IDS.CONVERSATION_QUICK_REPLY_PREFIX}talk`)).toBeNull()
    expect(screen.getByTestId(TEST_IDS.CONVERSATION_TIME)).toHaveTextContent(
      format(new Date(STORED_USER.createdAt), 'HH:mm'),
    )
  })

  it('shows the error, keeps the text and resends the same text with Tentar de novo', async () => {
    server.use(mockTrpcError('conversation.send', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<ConversationScreen />)
    await fireEvent.changeText(screen.getByTestId(TEST_IDS.CONVERSATION_INPUT), 'Oi')
    await waitFor(() => expect(screen.getByTestId(TEST_IDS.CONVERSATION_SEND)).toBeEnabled())
    await fireEvent.press(screen.getByTestId(TEST_IDS.CONVERSATION_SEND))

    await waitFor(() => expect(screen.getByText('Não foi possível enviar agora.')).toBeTruthy())
    expect(screen.getByTestId(TEST_IDS.CONVERSATION_INPUT).props.value).toBe('Oi')
    expect(screen.queryByTestId(`${TEST_IDS.CONVERSATION_MESSAGE_PREFIX}user`)).toBeNull()

    const payloads: unknown[] = []
    answerSend(payloads)
    await fireEvent.press(screen.getByTestId(TEST_IDS.CONVERSATION_RETRY))

    await waitFor(() => expect(screen.getByText('Estou aqui para ouvir.')).toBeTruthy())
    expect(payloads).toEqual([{ text: 'Oi', localDate: LOCAL_DATE }])
    expect(screen.queryByText('Não foi possível enviar agora.')).toBeNull()
    expect(screen.getByTestId(TEST_IDS.CONVERSATION_INPUT).props.value).toBe('')
  })

  it('resends a failed quick reply with its intent', async () => {
    server.use(mockTrpcError('conversation.send', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<ConversationScreen />)
    await waitFor(() => expect(screen.getByText('Quero conversar')).toBeTruthy())
    await fireEvent.press(screen.getByTestId(`${TEST_IDS.CONVERSATION_QUICK_REPLY_PREFIX}talk`))
    await waitFor(() => expect(screen.getByText('Não foi possível enviar agora.')).toBeTruthy())
    expect(screen.getByText('Quero conversar')).toBeTruthy()

    const payloads: unknown[] = []
    answerSend(payloads)
    await fireEvent.press(screen.getByTestId(TEST_IDS.CONVERSATION_RETRY))

    await waitFor(() => expect(screen.getByText('Estou aqui para ouvir.')).toBeTruthy())
    expect(payloads).toEqual([{ text: 'Quero conversar', localDate: LOCAL_DATE, intent: 'talk' }])
  })

  it('shows the daily limit message, without a retry, on TOO_MANY_REQUESTS', async () => {
    server.use(mockTrpcError('conversation.send', TRPC_ERROR_CODES.TOO_MANY_REQUESTS, 429))
    await renderWithProviders(<ConversationScreen />)
    await fireEvent.changeText(screen.getByTestId(TEST_IDS.CONVERSATION_INPUT), 'Oi')
    await waitFor(() => expect(screen.getByTestId(TEST_IDS.CONVERSATION_SEND)).toBeEnabled())
    await fireEvent.press(screen.getByTestId(TEST_IDS.CONVERSATION_SEND))

    await waitFor(() =>
      expect(
        screen.getByText('Você chegou ao limite de mensagens por agora. Tente de novo mais tarde.'),
      ).toBeTruthy(),
    )
    expect(screen.queryByTestId(TEST_IDS.CONVERSATION_RETRY)).toBeNull()
  })

  it('follows the newest message when the content grows', async () => {
    await renderWithProviders(<ConversationScreen />)
    mockContentSizeChange?.()
    expect(mockScrollToEnd).toHaveBeenCalledWith({ animated: true })
  })

  it('does nothing when the content grows before the list is attached', async () => {
    mockAttachReference = false
    await renderWithProviders(<ConversationScreen />)
    mockContentSizeChange?.()
    expect(mockScrollToEnd).not.toHaveBeenCalled()
  })

  it('shows the coming soon toast from the history button', async () => {
    const show = jest.spyOn(ToastAndroid, 'show').mockImplementation(() => {})
    await renderWithProviders(<ConversationScreen />)
    await fireEvent.press(screen.getByText('Histórico'))
    expect(show).toHaveBeenCalledWith('Em breve', ToastAndroid.SHORT)
    show.mockRestore()
  })
})

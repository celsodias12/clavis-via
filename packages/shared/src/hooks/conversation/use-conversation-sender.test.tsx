import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw/http'
import { useRef } from 'react'
import { describe, expect, it } from 'vite-plus/test'
import { mockQuery, mockTrpcError } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { TEST_API_BASE_URL } from '../../../tests/utils/test-constants'
import type { QuickReply } from '../../@types/conversation.type'
import { TRPC_ERROR_CODES } from '../../constants/api.constant'
import { QUICK_REPLIES } from '../../constants/conversation.constant'
import { useConversationSender } from './use-conversation-sender'

const SEND_URL = `${TEST_API_BASE_URL}/trpc/conversation.send`
const LOCAL_DATE = '2026-10-20'
const USER = { id: 'm1', role: 'user', text: 'Oi', createdAt: '2026-10-20T12:00:00.000Z' }
const REPLY = { id: 'm2', role: 'assistant', text: 'Olá', createdAt: '2026-10-20T12:00:01.000Z' }

const [TALK] = QUICK_REPLIES

// A field kept in a ref, with buttons that drive the hook.
function Probe({ initialText }: Readonly<{ initialText: string }>) {
  const field = useRef(initialText)
  const sender = useConversationSender({
    localDate: LOCAL_DATE,
    getFieldText: () => field.current,
    clearField: () => {
      field.current = ''
    },
    getQuickReplyText: (reply: QuickReply) => `label:${reply.intent}`,
  })
  return (
    <>
      <span>{`field:${field.current}|${sender.send.isError ? 'error' : 'ok'}`}</span>
      <button type="button" onClick={() => sender.submitText('Oi')}>
        <span>text</span>
      </button>
      <button type="button" onClick={() => sender.selectQuickReply(TALK)}>
        <span>quick</span>
      </button>
      <button type="button" onClick={() => (field.current = 'novo')}>
        <span>type</span>
      </button>
      <button
        type="button"
        onClick={() =>
          sender.submitPayload(sender.send.variables ?? { text: 'x', localDate: LOCAL_DATE })
        }
      >
        <span>resend</span>
      </button>
    </>
  )
}

function answer(payloads: unknown[]) {
  server.use(
    mockQuery('conversation.list', () => []),
    http.post(SEND_URL, async ({ request }) => {
      payloads.push(await request.json())
      return HttpResponse.json({ result: { data: { userMessage: USER, assistantMessage: REPLY } } })
    }),
  )
}

describe('useConversationSender', () => {
  it('sends the text and empties the field when it still holds that text', async () => {
    const payloads: unknown[] = []
    answer(payloads)
    renderWithProviders(<Probe initialText="Oi" />)

    fireEvent.click(screen.getByText('text'))

    await waitFor(() => expect(payloads).toEqual([{ text: 'Oi', localDate: LOCAL_DATE }]))
    await waitFor(() => expect(field()).toBe('field:|ok'))
  })

  it('keeps the field when it changed while the message was on its way', async () => {
    const payloads: unknown[] = []
    answer(payloads)
    renderWithProviders(<Probe initialText="Oi" />)

    fireEvent.click(screen.getByText('type'))
    fireEvent.click(screen.getByText('text'))

    await waitFor(() => expect(payloads).toHaveLength(1))
    await act(async () => {})
    expect(field()).toBe('field:novo|ok')
  })

  it('sends a quick reply once, with its text and intent, even when pressed twice at once', async () => {
    const payloads: unknown[] = []
    answer(payloads)
    renderWithProviders(<Probe initialText="" />)

    await act(async () => {
      fireEvent.click(screen.getByText('quick'))
      fireEvent.click(screen.getByText('quick'))
    })

    await waitFor(() => expect(payloads).toHaveLength(1))
    expect(payloads).toEqual([{ text: 'label:talk', localDate: LOCAL_DATE, intent: 'talk' }])
  })

  it('swallows a failure, keeps the field and lets the same payload be resent', async () => {
    server.use(
      mockQuery('conversation.list', () => []),
      mockTrpcError('conversation.send', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500),
    )
    renderWithProviders(<Probe initialText="Oi" />)

    fireEvent.click(screen.getByText('text'))

    await waitFor(() => expect(field()).toBe('field:Oi|error'))

    const payloads: unknown[] = []
    answer(payloads)
    fireEvent.click(screen.getByText('resend'))

    await waitFor(() => expect(payloads).toEqual([{ text: 'Oi', localDate: LOCAL_DATE }]))
  })
})

function field() {
  return screen.getByText(/^field:/).textContent
}

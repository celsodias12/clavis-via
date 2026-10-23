import { useQuery } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw/http'
import { describe, expect, it } from 'vite-plus/test'
import { mockMutation, mockQuery, mockTrpcError } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { TEST_API_BASE_URL } from '../../../tests/utils/test-constants'
import { TRPC_ERROR_CODES } from '../../constants/api.constant'
import { useApi } from '../../trpc/trpc.service'
import { useSendMessage } from './use-send-message'

const SEND_URL = `${TEST_API_BASE_URL}/trpc/conversation.send`
const LOCAL_DATE = '2026-10-20'

const FIRST = { id: 'm1', role: 'user', text: 'Oi', createdAt: '2026-10-20T12:00:00.000Z' }
const REPLY = { id: 'm2', role: 'assistant', text: 'Olá', createdAt: '2026-10-20T12:00:01.000Z' }
const SECOND = { id: 'm3', role: 'user', text: 'Tudo bem?', createdAt: '2026-10-20T12:01:00.000Z' }

// Shows the cached list (without refetching on its own) and sends a message.
function Probe({ isListObserved }: Readonly<{ isListObserved: boolean }>) {
  const trpc = useApi()
  const list = useQuery({ ...trpc.conversation.list.queryOptions(), enabled: isListObserved })
  const { mutate, isPending, isError } = useSendMessage()
  return (
    <>
      <span>{`list:${list.data ? list.data.map((message) => message.text).join('|') : 'none'}`}</span>
      <span>{`state:${isPending ? 'pending' : isError ? 'error' : 'idle'}`}</span>
      <button type="button" onClick={() => mutate({ text: 'Tudo bem?', localDate: LOCAL_DATE })}>
        <span>send</span>
      </button>
    </>
  )
}

describe('useSendMessage', () => {
  it('adds the message of the person at once, then the stored message and the reply', async () => {
    let stored = [FIRST, REPLY]
    let release: () => void = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      mockQuery('conversation.list', () => stored),
      http.post(SEND_URL, async () => {
        await gate
        const answer = { id: 'm4', role: 'assistant', text: 'Que bom', createdAt: SECOND.createdAt }
        stored = [...stored, SECOND, answer]
        return HttpResponse.json({
          result: { data: { userMessage: SECOND, assistantMessage: answer } },
        })
      }),
    )
    renderWithProviders(<Probe isListObserved />)
    await waitFor(() => expect(screen.getByText('list:Oi|Olá')).toBeTruthy())

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.getByText('list:Oi|Olá|Tudo bem?')).toBeTruthy())
    expect(screen.getByText('state:pending')).toBeTruthy()
    release()
    await waitFor(() => expect(screen.getByText('list:Oi|Olá|Tudo bem?|Que bom')).toBeTruthy())
  })

  it('takes the message of the person out again when the send fails', async () => {
    server.use(
      mockQuery('conversation.list', () => [FIRST, REPLY]),
      mockTrpcError('conversation.send', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500),
    )
    renderWithProviders(<Probe isListObserved />)
    await waitFor(() => expect(screen.getByText('list:Oi|Olá')).toBeTruthy())

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.getByText('state:error')).toBeTruthy())
    expect(screen.getByText('list:Oi|Olá')).toBeTruthy()
  })

  it('leaves a list that is not loaded alone, on success and on failure', async () => {
    let fails = false
    server.use(
      mockQuery('conversation.list', () => []),
      http.post(SEND_URL, () =>
        fails
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
          : HttpResponse.json({
              result: { data: { userMessage: SECOND, assistantMessage: REPLY } },
            }),
      ),
    )
    renderWithProviders(<Probe isListObserved={false} />)

    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(screen.getByText('state:idle')).toBeTruthy())
    expect(screen.getByText('list:none')).toBeTruthy()

    fails = true
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(screen.getByText('state:error')).toBeTruthy())
    expect(screen.getByText('list:none')).toBeTruthy()
  })

  it('refetches the list when the send settles', async () => {
    let reads = 0
    server.use(
      mockQuery('conversation.list', () => {
        reads += 1
        return []
      }),
      mockMutation('conversation.send', () => ({ userMessage: SECOND, assistantMessage: REPLY })),
    )
    renderWithProviders(<Probe isListObserved />)
    await waitFor(() => expect(reads).toBe(1))

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(reads).toBe(2))
  })
})

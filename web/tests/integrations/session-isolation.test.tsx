import {
  type ConversationMessage,
  useApi,
  useConversationMessages,
  useSendMessage,
} from '@clavis-via/shared'
import { server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { useAuth } from '@clerk/react'
import { type QueryClient, type QueryKey, useQueryClient } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw/http'
import { expect, it } from 'vite-plus/test'
import { ContextProviders } from '../../src/contexts'
import { clerkMock } from '../utils/clerk-mock'

const CASES = [
  {
    name: 'sign-out and another account',
    nextUser: 'user_b',
    signOutFirst: true,
    unauthorized: false,
  },
  { name: 'direct account switch', nextUser: 'user_b', signOutFirst: false, unauthorized: false },
  {
    name: 'sign-out and the same account',
    nextUser: 'user_a',
    signOutFirst: true,
    unauthorized: false,
  },
  {
    name: 'a late unauthorized response',
    nextUser: 'user_b',
    signOutFirst: true,
    unauthorized: true,
  },
]

it.each(CASES)(
  'isolates a pending send across $name',
  async ({ nextUser, signOutFirst, unauthorized }) => {
    clerkMock.state = { isLoaded: true, isSignedIn: true, userId: 'user_a' }
    let releaseSend = () => {}
    const gate = new Promise<void>((resolve) => {
      releaseSend = resolve
    })
    let sendStarted = false
    let pendingSend: Promise<unknown> | undefined
    let currentScope: { client: QueryClient; listKey: QueryKey } | undefined

    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/conversation.list`, () =>
        HttpResponse.json({ result: { data: [] } }),
      ),
      http.post(`${TEST_API_BASE_URL}/trpc/conversation.send`, async () => {
        sendStarted = true
        await gate
        if (unauthorized) {
          return HttpResponse.json(
            {
              error: {
                message: 'UNAUTHORIZED',
                code: -32001,
                data: { code: 'UNAUTHORIZED', httpStatus: 401 },
              },
            },
            { status: 401 },
          )
        }
        const createdAt = new Date().toISOString()
        return HttpResponse.json({
          result: {
            data: {
              userMessage: { id: 'a-user', role: 'user', text: 'PRIVATE-A', createdAt },
              assistantMessage: {
                id: 'a-assistant',
                role: 'assistant',
                text: 'PRIVATE-REPLY-A',
                createdAt,
              },
            },
          },
        })
      }),
    )

    function Conversation() {
      const client = useQueryClient()
      const api = useApi()
      currentScope = { client, listKey: api.conversation.list.queryKey() }
      const messages = useConversationMessages()
      const send = useSendMessage()
      return (
        <>
          <p data-testid="messages">
            {messages.data?.map((message) => message.text).join('|') ?? 'pending'}
          </p>
          <button
            type="button"
            onClick={() => {
              pendingSend = send
                .mutateAsync({ text: 'PRIVATE-A', localDate: '2026-10-22' })
                .catch(() => {})
            }}
          >
            send
          </button>
        </>
      )
    }
    function Gate() {
      return useAuth().isSignedIn ? <Conversation /> : <p>signed out</p>
    }

    render(
      <ContextProviders>
        <Gate />
      </ContextProviders>,
    )
    await waitFor(() => expect(screen.getByTestId('messages').textContent).toBe(''))
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(sendStarted).toBe(true))
    if (signOutFirst) {
      await act(async () => clerkMock.setState({ isLoaded: true, isSignedIn: false, userId: null }))
    }
    await act(async () =>
      clerkMock.setState({ isLoaded: true, isSignedIn: true, userId: nextUser }),
    )
    await waitFor(() => expect(screen.getByTestId('messages').textContent).toBe(''))

    const exposures: string[] = []
    if (currentScope === undefined) {
      throw new Error('The signed-in conversation must expose its query scope')
    }
    const { client, listKey } = currentScope
    const unsubscribe = client.getQueryCache().subscribe(() => {
      const messages = client.getQueryData<ConversationMessage[]>(listKey)
      for (const message of messages ?? []) {
        if (message.text.includes('PRIVATE-A')) exposures.push(message.text)
      }
    })
    try {
      await act(async () => {
        releaseSend()
        await pendingSend
      })
      expect(exposures).toEqual([])
      expect(screen.getByTestId('messages').textContent).toBe('')
      expect(clerkMock.signOut).not.toHaveBeenCalled()
      expect(clerkMock.endSession).not.toHaveBeenCalled()
    } finally {
      unsubscribe()
    }
  },
)

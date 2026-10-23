import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { mockQuery } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { useConversationMessages } from './use-conversation-messages'

function Probe() {
  const { data } = useConversationMessages()
  return <span>{data ? data.map((message) => message.text).join('|') : 'loading'}</span>
}

describe('useConversationMessages', () => {
  it('loads the stored messages, oldest first', async () => {
    server.use(
      mockQuery('conversation.list', () => [
        { id: '1', role: 'user', text: 'Oi', createdAt: '2026-10-20T12:00:00.000Z' },
        { id: '2', role: 'assistant', text: 'Olá', createdAt: '2026-10-20T12:00:01.000Z' },
      ]),
    )
    renderWithProviders(<Probe />)
    await waitFor(() => expect(screen.getByText('Oi|Olá')).toBeTruthy())
  })
})

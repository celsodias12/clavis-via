import {
  type ConversationFormInput,
  type ConversationFormValues,
  conversationFormSchema,
  TEST_IDS,
} from '@clavis-via/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vite-plus/test'
import { ChatInput } from './chat-input.component'

type HarnessProps = Readonly<{ onSubmit: () => unknown; isSending?: boolean }>

function Harness({ onSubmit, isSending = false }: HarnessProps) {
  const { control, formState } = useForm<ConversationFormInput, unknown, ConversationFormValues>({
    resolver: zodResolver(conversationFormSchema),
    mode: 'onChange',
    defaultValues: { text: '' },
  })
  return (
    <ChatInput
      control={control}
      onSubmit={onSubmit}
      canSend={formState.isValid}
      isSending={isSending}
    />
  )
}

function input() {
  return screen.getByTestId(TEST_IDS.CONVERSATION_INPUT)
}

function send() {
  return screen.getByTestId(TEST_IDS.CONVERSATION_SEND) as HTMLButtonElement
}

async function type(text: string) {
  fireEvent.change(input(), { target: { value: text } })
  await waitFor(() => expect(send().disabled).toBe(text.trim() === ''))
}

describe('ChatInput', () => {
  it('labels the field and keeps the send button disabled while the text is blank', async () => {
    render(<Harness onSubmit={vi.fn()} />)

    expect(screen.getByLabelText('Mensagem')).toBe(input())
    expect(input().getAttribute('placeholder')).toBe('Escreva aqui o que você está sentindo...')
    expect(send().disabled).toBe(true)
    await type('   ')
    await type('Oi')
    expect(send().disabled).toBe(false)
  })

  it('sends on click, only once for a double click', async () => {
    const onSubmit = vi.fn(() => new Promise<void>(() => {}))
    render(<Harness onSubmit={onSubmit} />)
    await type('Oi')

    fireEvent.click(send())
    fireEvent.click(send())

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('sends with Enter and starts a new line with Shift+Enter', async () => {
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} />)
    await type('Oi')

    expect(fireEvent.keyDown(input(), { key: 'Enter', shiftKey: true })).toBe(true)
    expect(onSubmit).not.toHaveBeenCalled()

    expect(fireEvent.keyDown(input(), { key: 'Enter' })).toBe(false)
    expect(onSubmit).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(input(), { key: 'a' })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('does not send with Enter while the text is blank, while sending or while composing', async () => {
    const onSubmit = vi.fn()
    const { rerender } = render(<Harness onSubmit={onSubmit} />)

    fireEvent.keyDown(input(), { key: 'Enter' })
    await type('Oi')
    fireEvent.keyDown(input(), { key: 'Enter', isComposing: true })
    rerender(<Harness onSubmit={onSubmit} isSending />)
    fireEvent.keyDown(input(), { key: 'Enter' })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows a spinner and locks the button while sending', async () => {
    render(<Harness onSubmit={vi.fn()} isSending />)
    fireEvent.change(input(), { target: { value: 'Oi' } })

    expect(screen.getByTestId(TEST_IDS.CONVERSATION_SEND_SPINNER)).toBeTruthy()
    expect(send().disabled).toBe(true)
    expect(send().getAttribute('aria-busy')).toBe('true')
  })
})

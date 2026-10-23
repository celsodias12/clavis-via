import {
  type ConversationFormInput,
  type ConversationFormValues,
  conversationFormSchema,
  TEST_IDS,
} from '@clavis-via/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { useForm } from 'react-hook-form'
import { ChatInput } from './chat-input.component'

type HarnessProps = Readonly<{
  onSubmit: () => unknown
  isSending?: boolean
  canSend?: boolean
}>

function Harness({ onSubmit, isSending = false, canSend = true }: HarnessProps) {
  const { control } = useForm<ConversationFormInput, unknown, ConversationFormValues>({
    resolver: zodResolver(conversationFormSchema),
    defaultValues: { text: '' },
  })
  return <ChatInput control={control} onSubmit={onSubmit} canSend={canSend} isSending={isSending} />
}

describe('ChatInput', () => {
  it('shows the placeholder and takes typed text', async () => {
    await render(<Harness onSubmit={jest.fn()} />)
    const input = screen.getByPlaceholderText('Escreva aqui o que você está sentindo...')
    await fireEvent.changeText(input, 'Oi')
    expect(screen.getByTestId(TEST_IDS.CONVERSATION_INPUT).props.value).toBe('Oi')
  })

  it('calls onSubmit when the button is pressed', async () => {
    const onSubmit = jest.fn()
    await render(<Harness onSubmit={onSubmit} />)
    await fireEvent.press(screen.getByTestId(TEST_IDS.CONVERSATION_SEND))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('locks the button until the submit settles, so a second tap is ignored', async () => {
    let finish: () => void = () => {}
    const onSubmit = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        }),
    )
    await render(<Harness onSubmit={onSubmit} />)
    const send = screen.getByTestId(TEST_IDS.CONVERSATION_SEND)

    await fireEvent.press(send)
    await fireEvent.press(send)
    expect(onSubmit).toHaveBeenCalledTimes(1)

    await act(async () => {
      finish()
    })
    await fireEvent.press(send)
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })

  it('unlocks the button when the submit fails', async () => {
    const onSubmit = jest.fn(() => Promise.reject(new Error('boom')))
    await render(<Harness onSubmit={onSubmit} />)
    const send = screen.getByTestId(TEST_IDS.CONVERSATION_SEND)

    await fireEvent.press(send)
    await act(async () => {})
    await fireEvent.press(send)
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })

  it('disables the button when nothing can be sent', async () => {
    const onSubmit = jest.fn()
    await render(<Harness onSubmit={onSubmit} canSend={false} />)
    const send = screen.getByTestId(TEST_IDS.CONVERSATION_SEND)
    expect(send).toBeDisabled()
    await fireEvent.press(send)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows a spinner and stays disabled while sending', async () => {
    const onSubmit = jest.fn()
    await render(<Harness onSubmit={onSubmit} isSending />)
    expect(screen.getByTestId(TEST_IDS.CONVERSATION_SEND_SPINNER)).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.CONVERSATION_SEND)).toBeDisabled()
  })
})

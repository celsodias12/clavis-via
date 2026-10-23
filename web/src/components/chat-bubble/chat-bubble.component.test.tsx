import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { ChatBubble } from './chat-bubble.component'

describe('ChatBubble', () => {
  it('puts the assistant on the left and the person on the right', () => {
    render(
      <>
        <ChatBubble author="assistant" text="Olá" testID="assistant" />
        <ChatBubble author="user" text="Oi" testID="user" />
      </>,
    )

    expect(screen.getByTestId('assistant').className).toContain('self-start')
    expect(screen.getByTestId('user').className).toContain('self-end')
    expect(screen.getByTestId('user').textContent).toBe('Oi')
  })

  it('hugs the text unless it is told to take the whole width', () => {
    render(
      <>
        <ChatBubble author="assistant" text="Curto" testID="hug" />
        <ChatBubble author="assistant" text="Largo" isFullWidth testID="full" />
      </>,
    )

    expect(screen.getByTestId('hug').className).not.toContain('w-full')
    expect(screen.getByTestId('full').className).toContain('w-full')
  })
})

import { render, screen } from '@testing-library/react-native'
import { ChatBubble } from './chat-bubble.component'

describe('ChatBubble', () => {
  it('renders the text of an assistant message', async () => {
    await render(<ChatBubble author="assistant" text="Estou aqui." testID="bubble" />)
    expect(screen.getByTestId('bubble')).toHaveTextContent('Estou aqui.')
  })

  it('renders the text of the person on the right side', async () => {
    await render(<ChatBubble author="user" text="Oi" testID="bubble" />)
    expect(screen.getByTestId('bubble')).toHaveTextContent('Oi')
    expect(screen.getByTestId('bubble')).toHaveStyle({ alignSelf: 'flex-end' })
  })

  it('keeps an assistant message on the left side', async () => {
    await render(<ChatBubble author="assistant" text="Oi" testID="bubble" />)
    expect(screen.getByTestId('bubble')).toHaveStyle({ alignSelf: 'flex-start' })
  })

  it('stretches to the width of its parent when asked to', async () => {
    await render(<ChatBubble author="user" text="Oi" testID="bubble" isFullWidth />)
    expect(screen.getByTestId('bubble')).toHaveStyle({ alignSelf: 'stretch', maxWidth: '100%' })
  })
})

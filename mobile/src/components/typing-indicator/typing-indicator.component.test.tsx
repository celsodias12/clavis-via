import { TEST_IDS } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react-native'
import { TypingIndicator } from './typing-indicator.component'

describe('TypingIndicator', () => {
  it('shows the typing text', async () => {
    await render(<TypingIndicator />)
    expect(screen.getByTestId(TEST_IDS.CONVERSATION_TYPING)).toHaveTextContent('digitando…')
  })
})

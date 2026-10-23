import { QUICK_REPLIES } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { QuickReplies } from './quick-replies.component'

describe('QuickReplies', () => {
  it('renders the four pills in the order of the design', async () => {
    await render(<QuickReplies replies={QUICK_REPLIES} onSelect={jest.fn()} isDisabled={false} />)
    const labels = screen.getAllByRole('button').map((button) => button.props.accessibilityLabel)
    expect(labels).toEqual([
      'Quero conversar',
      'Preciso de uma direção',
      'Quero fazer uma prática',
      'Quero um momento com Deus',
    ])
  })

  it('reports the pressed reply', async () => {
    const onSelect = jest.fn()
    await render(<QuickReplies replies={QUICK_REPLIES} onSelect={onSelect} isDisabled={false} />)
    await fireEvent.press(screen.getByTestId('conversation-quick-reply-direction'))
    expect(onSelect).toHaveBeenCalledWith(QUICK_REPLIES[1])
  })

  it('ignores presses while disabled', async () => {
    const onSelect = jest.fn()
    await render(<QuickReplies replies={QUICK_REPLIES} onSelect={onSelect} isDisabled />)
    await fireEvent.press(screen.getByTestId('conversation-quick-reply-talk'))
    expect(onSelect).not.toHaveBeenCalled()
  })
})

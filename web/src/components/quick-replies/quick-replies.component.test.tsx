import { QUICK_REPLIES, TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { QuickReplies } from './quick-replies.component'

describe('QuickReplies', () => {
  it('shows one pill per reply and reports the one that is clicked', () => {
    const onSelect = vi.fn()
    render(<QuickReplies replies={QUICK_REPLIES} onSelect={onSelect} isDisabled={false} />)

    expect(screen.getAllByRole('button')).toHaveLength(4)
    fireEvent.click(screen.getByTestId(`${TEST_IDS.CONVERSATION_QUICK_REPLY_PREFIX}direction`))

    expect(onSelect).toHaveBeenCalledWith(QUICK_REPLIES[1])
    expect(screen.getByText('Preciso de uma direção')).toBeTruthy()
  })

  it('ignores clicks while a message is being sent', () => {
    const onSelect = vi.fn()
    render(<QuickReplies replies={QUICK_REPLIES} onSelect={onSelect} isDisabled />)

    fireEvent.click(screen.getByText('Quero conversar'))

    expect(onSelect).not.toHaveBeenCalled()
    expect((screen.getByText('Quero conversar') as HTMLButtonElement).disabled).toBe(true)
  })
})

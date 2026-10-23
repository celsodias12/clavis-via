import { TEST_IDS } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { TypingIndicator } from './typing-indicator.component'

describe('TypingIndicator', () => {
  it('shows the assistant typing', () => {
    render(<TypingIndicator />)

    expect(screen.getByTestId(TEST_IDS.CONVERSATION_TYPING).textContent).toBe('digitando…')
  })
})

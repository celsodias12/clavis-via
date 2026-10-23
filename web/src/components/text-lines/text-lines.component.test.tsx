import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { TextLines } from './text-lines.component'

describe('TextLines', () => {
  it('renders one block per line, in a paragraph by default', () => {
    const { container } = render(<TextLines text={'primeira\nsegunda'} lineClassName="block" />)

    expect(container.querySelector('p')).toBeTruthy()
    expect(screen.getByText('primeira').className).toBe('block')
    expect(screen.getByText('segunda')).toBeTruthy()
  })

  it('renders in the given element', () => {
    render(<TextLines as="h1" text="título" />)

    expect(screen.getByRole('heading', { name: 'título' })).toBeTruthy()
  })

  it('flows the text on one line of copy when asked, replacing the breaks with spaces', () => {
    render(<TextLines as="h1" text={'primeira\nsegunda'} isFlowing />)

    expect(screen.getByRole('heading', { name: 'primeira segunda' }).children).toHaveLength(0)
  })
})

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { AppIcon } from './app-icon.component'

describe('AppIcon', () => {
  it('draws every path in the 24 unit view box, hidden from assistive technology', () => {
    const { container } = render(
      <AppIcon
        testID="icon"
        size={20}
        paths={[
          { d: 'M0 0 H1', stroke: 'red', strokeWidth: 2 },
          { d: 'M2 2 H3', fill: 'blue', stroke: 'green' },
        ]}
      />,
    )

    const svg = container.querySelector('svg')
    const [first, second] = [...container.querySelectorAll('path')]

    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(svg?.getAttribute('width')).toBe('20')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(svg?.getAttribute('data-testid')).toBe('icon')
    expect(first.getAttribute('d')).toBe('M0 0 H1')
    expect(first.getAttribute('fill')).toBe('none')
    expect(first.getAttribute('stroke')).toBe('red')
    expect(first.getAttribute('stroke-width')).toBe('2')
    expect(second.getAttribute('fill')).toBe('blue')
  })

  it('defaults the paint to none', () => {
    const { container } = render(<AppIcon size={10} paths={[{ d: 'M0 0' }]} />)

    const path = container.querySelector('path')

    expect(path?.getAttribute('fill')).toBe('none')
    expect(path?.getAttribute('stroke')).toBe('none')
  })
})

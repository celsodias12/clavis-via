import { render } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { PlanMetaIcon } from './plan-meta-icon.component'

describe('PlanMetaIcon', () => {
  it.each(['calendar', 'clock'] as const)(
    'renders the %s icon hidden from accessibility',
    (icon) => {
      const { container } = render(<PlanMetaIcon icon={icon} />)

      expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    },
  )

  it('draws different shapes for the two icons', () => {
    const calendar = render(<PlanMetaIcon icon="calendar" />).container.innerHTML
    const clock = render(<PlanMetaIcon icon="clock" />).container.innerHTML

    expect(clock).not.toBe(calendar)
  })
})

import { render, screen } from '@testing-library/react-native'
import { PlanMetaIcon } from './plan-meta-icon.component'

describe('PlanMetaIcon', () => {
  it.each(['calendar', 'clock'] as const)(
    'renders the %s icon hidden from accessibility',
    async (icon) => {
      const { toJSON } = await render(<PlanMetaIcon icon={icon} />)
      expect(toJSON()).toBeTruthy()
      expect(screen.queryByRole('button')).toBeNull()
    },
  )

  it('draws different shapes for the two icons', async () => {
    const { toJSON, rerender } = await render(<PlanMetaIcon icon="calendar" />)
    const calendar = JSON.stringify(toJSON())
    await rerender(<PlanMetaIcon icon="clock" />)
    expect(JSON.stringify(toJSON())).not.toBe(calendar)
  })
})

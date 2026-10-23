import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { PlanListItem } from './plan-list-item.component'

const PLAN = {
  id: 'when-discouragement-weighs',
  title: 'Quando o desânimo pesar',
  category: 'emotions',
  totalDays: 3,
} as const

describe('PlanListItem', () => {
  it('shows the title and the duration with its plural', async () => {
    await render(<PlanListItem plan={PLAN} onPress={jest.fn()} />)
    expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy()
    expect(screen.getByText('3 dias')).toBeTruthy()
  })

  it('uses the singular for one day', async () => {
    await render(<PlanListItem plan={{ ...PLAN, totalDays: 1 }} onPress={jest.fn()} />)
    expect(screen.getByText('1 dia')).toBeTruthy()
  })

  it('is a button named after the plan, with the plan test ID', async () => {
    const onPress = jest.fn()
    await render(<PlanListItem plan={PLAN} onPress={onPress} />)
    const item = screen.getByTestId(`${TEST_IDS.PLANS_ITEM_PREFIX}when-discouragement-weighs`)
    expect(item).toHaveProp('accessibilityRole', 'button')
    await fireEvent.press(item)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('renders a plan without images of its own', async () => {
    await render(<PlanListItem plan={{ ...PLAN, id: 'unknown-plan' }} onPress={jest.fn()} />)
    expect(screen.getByTestId(`${TEST_IDS.PLANS_ITEM_PREFIX}unknown-plan`)).toBeTruthy()
  })
})

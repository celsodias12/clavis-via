import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { CurrentPlanCard } from './current-plan-card.component'

const PLAN = {
  planId: 'when-discouragement-weighs',
  title: 'Quando o desânimo pesar',
  totalDays: 3,
  completedDays: 1,
  nextDayNumber: 2,
}

describe('CurrentPlanCard', () => {
  it('shows the plan, its next day and the progress, and reports the press', async () => {
    const onPress = jest.fn()
    await render(<CurrentPlanCard plan={PLAN} onPress={onPress} />)
    expect(screen.getByText('Continue sua jornada')).toBeTruthy()
    expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy()
    expect(screen.getByText('Dia 2 de 3')).toBeTruthy()
    expect(
      screen.getByRole('progressbar', { name: 'Progresso do plano' }).props.accessibilityValue.now,
    ).toBe(33)

    await fireEvent.press(screen.getByTestId(TEST_IDS.HOME_CURRENT_PLAN))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('invites to pick a plan, with no day and no progress, when there is none', async () => {
    const onPress = jest.fn()
    await render(<CurrentPlanCard plan={null} onPress={onPress} />)
    expect(screen.getByText('Escolha um plano para começar.')).toBeTruthy()
    expect(screen.queryByText(/^Dia /)).toBeNull()
    expect(screen.queryByRole('progressbar')).toBeNull()

    await fireEvent.press(screen.getByTestId(TEST_IDS.HOME_CURRENT_PLAN))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

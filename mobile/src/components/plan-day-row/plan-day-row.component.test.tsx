import { fireEvent, render, screen } from '@testing-library/react-native'
import { PlanDayRow } from './plan-day-row.component'

describe('PlanDayRow', () => {
  it('shows the number in the circle, "Dia N" and the title of an open day', async () => {
    await render(
      <PlanDayRow
        dayNumber={2}
        title="Pequenos movimentos"
        isCompleted={false}
        onPress={jest.fn()}
      />,
    )
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('Dia 2')).toBeTruthy()
    expect(screen.getByText('Pequenos movimentos')).toBeTruthy()
    expect(screen.queryByTestId('plan-day-row-2-completed')).toBeNull()
  })

  it('swaps the number for a completed mark once the day is done', async () => {
    await render(
      <PlanDayRow dayNumber={1} title="Respirar e reconhecer" isCompleted onPress={jest.fn()} />,
    )
    expect(screen.getByTestId('plan-day-row-1-completed')).toBeTruthy()
    expect(screen.getByLabelText('Dia concluído')).toBeTruthy()
    expect(screen.queryByText('1')).toBeNull()
  })

  it('opens the day when pressed and draws a separator only when asked', async () => {
    const onPress = jest.fn()
    const { toJSON } = await render(
      <PlanDayRow dayNumber={3} title="Voltar a acreditar" isCompleted={false} onPress={onPress} />,
    )
    const withoutSeparator = JSON.stringify(toJSON()).length
    await fireEvent.press(screen.getByTestId('plan-day-row-3'))
    expect(onPress).toHaveBeenCalledTimes(1)

    await render(
      <PlanDayRow
        dayNumber={3}
        title="Voltar a acreditar"
        isCompleted={false}
        hasSeparator
        onPress={onPress}
      />,
    )
    expect(JSON.stringify(screen.toJSON()).length).toBeGreaterThan(withoutSeparator)
  })
})

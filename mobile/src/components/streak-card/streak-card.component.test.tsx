import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { StreakCard } from './streak-card.component'

const DATES = [
  '2026-10-19',
  '2026-10-20',
  '2026-10-21',
  '2026-10-22',
  '2026-10-23',
  '2026-10-24',
  '2026-10-25',
]

function week(checkedCount: number) {
  return DATES.map((localDate, index) => ({ localDate, hasCheckIn: index < checkedCount }))
}

describe('StreakCard', () => {
  it('shows the streak with its plural label and the seven weekdays', async () => {
    await render(<StreakCard streakDays={8} week={week(5)} onCalendarPress={jest.fn()} />)
    expect(screen.getByTestId(TEST_IDS.JOURNEY_STREAK_NUMBER).props.children).toBe('8')
    expect(screen.getByText('dias consecutivos')).toBeTruthy()
    for (const weekday of ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']) {
      expect(screen.getByText(weekday)).toBeTruthy()
    }
  })

  it('uses the singular label for one day', async () => {
    await render(<StreakCard streakDays={1} week={week(1)} onCalendarPress={jest.fn()} />)
    expect(screen.getByText('dia consecutivo')).toBeTruthy()
  })

  it('uses the plural for zero days', async () => {
    await render(<StreakCard streakDays={0} week={week(0)} onCalendarPress={jest.fn()} />)
    expect(screen.getByText('dias consecutivos')).toBeTruthy()
  })

  it('draws a check only on the days with a check-in and describes each day', async () => {
    await render(<StreakCard streakDays={2} week={week(2)} onCalendarPress={jest.fn()} />)
    const done = (localDate: string) =>
      screen.queryByTestId(
        `${TEST_IDS.JOURNEY_DAY_PREFIX}${localDate}${TEST_IDS.JOURNEY_DAY_DONE_SUFFIX}`,
      )
    expect(done('2026-10-19')).toBeTruthy()
    expect(done('2026-10-20')).toBeTruthy()
    expect(done('2026-10-21')).toBeNull()
    expect(screen.getByLabelText('Seg: check-in feito')).toBeTruthy()
    expect(screen.getByLabelText('Qua: sem check-in')).toBeTruthy()
  })

  it('calls the handler when the calendar is pressed', async () => {
    const onCalendarPress = jest.fn()
    await render(<StreakCard streakDays={0} week={week(0)} onCalendarPress={onCalendarPress} />)
    await fireEvent.press(screen.getByTestId(TEST_IDS.JOURNEY_CALENDAR))
    expect(onCalendarPress).toHaveBeenCalledTimes(1)
  })
})

import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { AchievementList } from './achievement-list.component'

const row = (kind: string) => screen.getByTestId(`${TEST_IDS.JOURNEY_ACHIEVEMENT_PREFIX}${kind}`)

describe('AchievementList', () => {
  it('renders each achievement in order with its plural form', async () => {
    await render(
      <AchievementList
        onAchievementPress={jest.fn()}
        achievements={[
          { kind: 'weekly-check-ins', count: 5 },
          {
            kind: 'plan-progress',
            planTitle: 'Quando o desânimo pesar',
            completedDays: 1,
            totalDays: 3,
          },
          { kind: 'completed-plans', count: 2 },
          { kind: 'completed-practices', count: 4 },
          { kind: 'completed-actions', count: 3 },
        ]}
      />,
    )
    expect(screen.getByText('Fiz 5 check-ins esta semana')).toBeTruthy()
    expect(screen.getByText('Quando o desânimo pesar: 1 de 3 dias')).toBeTruthy()
    expect(screen.getByText('Concluí 2 planos')).toBeTruthy()
    expect(screen.getByText('Fiz 4 práticas')).toBeTruthy()
    expect(screen.getByText('Concluí 3 ações do dia')).toBeTruthy()
  })

  it('uses the singular forms for one', async () => {
    await render(
      <AchievementList
        onAchievementPress={jest.fn()}
        achievements={[
          { kind: 'weekly-check-ins', count: 1 },
          { kind: 'completed-plans', count: 1 },
          { kind: 'completed-practices', count: 1 },
          { kind: 'completed-actions', count: 1 },
        ]}
      />,
    )
    expect(screen.getByText('Fiz 1 check-in esta semana')).toBeTruthy()
    expect(screen.getByText('Concluí 1 plano')).toBeTruthy()
    expect(screen.getByText('Fiz 1 prática')).toBeTruthy()
    expect(screen.getByText('Concluí 1 ação do dia')).toBeTruthy()
  })

  it('calls the handler when a row is pressed and leaves the last row without a divider', async () => {
    const onAchievementPress = jest.fn()
    await render(
      <AchievementList
        onAchievementPress={onAchievementPress}
        achievements={[
          { kind: 'weekly-check-ins', count: 2 },
          { kind: 'completed-actions', count: 1 },
        ]}
      />,
    )
    expect(
      screen.getByTestId(
        `${TEST_IDS.JOURNEY_ACHIEVEMENT_PREFIX}weekly-check-ins${TEST_IDS.LIST_ROW_DIVIDER_SUFFIX}`,
      ),
    ).toBeTruthy()
    expect(
      screen.queryByTestId(
        `${TEST_IDS.JOURNEY_ACHIEVEMENT_PREFIX}completed-actions${TEST_IDS.LIST_ROW_DIVIDER_SUFFIX}`,
      ),
    ).toBeNull()
    await fireEvent.press(row('completed-actions'))
    expect(onAchievementPress).toHaveBeenCalledTimes(1)
  })
})

import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { JOURNEY_ROW_METRICS } from '../../constants/journey-layout.constant'
import { ListRow } from './list-row.component'

describe('ListRow', () => {
  it.each([
    'subscription',
    'settings',
    'bell',
    'lock',
    'help',
    'logout',
    'handClipboard',
    'clipboardCheck',
    'target',
    'heart',
  ] as const)('renders the %s row as a button with its label and a divider', async (icon) => {
    const onPress = jest.fn()
    await render(<ListRow icon={icon} label="Notificações" onPress={onPress} testID="row" />)
    const row = screen.getByRole('button', { name: 'Notificações' })
    expect(screen.getByText('Notificações')).toBeTruthy()
    expect(screen.getByTestId(`row${TEST_IDS.LIST_ROW_DIVIDER_SUFFIX}`)).toBeTruthy()
    await fireEvent.press(row)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('omits the divider when asked to', async () => {
    await render(
      <ListRow icon="logout" label="Sair" onPress={jest.fn()} testID="row" hasDivider={false} />,
    )
    expect(screen.queryByTestId(`row${TEST_IDS.LIST_ROW_DIVIDER_SUFFIX}`)).toBeNull()
  })

  it('takes the measures and the inks it is given', async () => {
    await render(
      <ListRow
        icon="heart"
        label="Voltei a fazer algo que eu gosto"
        onPress={jest.fn()}
        metrics={JOURNEY_ROW_METRICS}
        inks={{ icon: '#111111', label: '#222222', chevron: '#333333' }}
      />,
    )
    expect(screen.getByText('Voltei a fazer algo que eu gosto')).toBeTruthy()
  })

  it('works without a test ID', async () => {
    await render(<ListRow icon="bell" label="Notificações" onPress={jest.fn()} />)
    expect(screen.queryByTestId(TEST_IDS.LIST_ROW_DIVIDER_SUFFIX)).toBeNull()
    expect(screen.getByRole('button', { name: 'Notificações' })).toBeTruthy()
  })

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn()
    await render(<ListRow icon="logout" label="Sair" onPress={onPress} isDisabled />)
    const row = screen.getByRole('button', { name: 'Sair' })
    expect(row.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }))
    await fireEvent.press(row)
    expect(onPress).not.toHaveBeenCalled()
  })
})

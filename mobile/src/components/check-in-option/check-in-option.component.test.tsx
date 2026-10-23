import { CHECK_IN_STATES, TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { CheckInOption } from './check-in-option.component'

describe('CheckInOption', () => {
  it('renders the label, the icon and a radio that reports its selection', async () => {
    const onPress = jest.fn()
    await render(
      <CheckInOption
        state={CHECK_IN_STATES.ANXIOUS}
        label="Ansiosa"
        isSelected
        onPress={onPress}
      />,
    )
    const radio = screen.getByRole('radio', { name: 'Ansiosa' })
    expect(radio.props.accessibilityState).toEqual(expect.objectContaining({ selected: true }))
    expect(screen.getByText('Ansiosa')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.EMOTION_ICON, { includeHiddenElements: true })).toBeTruthy()
    expect(screen.getByTestId(`${TEST_IDS.CHECK_IN_OPTION_PREFIX}anxious`)).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.CHECK_IN_OPTION_BORDER)).toBeTruthy()
  })

  it('has no selection border while unselected and calls onPress', async () => {
    const onPress = jest.fn()
    await render(
      <CheckInOption
        state={CHECK_IN_STATES.OTHER}
        label="Outro"
        isSelected={false}
        onPress={onPress}
      />,
    )
    expect(screen.queryByTestId(TEST_IDS.CHECK_IN_OPTION_BORDER)).toBeNull()
    expect(screen.getByRole('radio', { name: 'Outro' }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    )
    await fireEvent.press(screen.getByRole('radio', { name: 'Outro' }))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('paints the tile with the color of its state', async () => {
    await render(
      <CheckInOption
        state={CHECK_IN_STATES.HEAVY}
        label="Pesada"
        isSelected={false}
        onPress={jest.fn()}
      />,
    )
    const tile = screen.getByTestId(`${TEST_IDS.CHECK_IN_OPTION_PREFIX}heavy`)
    expect(StyleSheet.flatten(tile.props.style).backgroundColor).toBe('#e7edfd')
  })
})

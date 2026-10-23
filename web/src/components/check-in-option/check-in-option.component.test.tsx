import { CHECK_IN_STATES, TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { setViewportWidth } from '../../../tests/utils/viewport'
import { CHECK_IN_RADIO_GROUP_NAME } from '../../constants/check-in.constant'
import { CheckInOption } from './check-in-option.component'

describe('CheckInOption', () => {
  it('renders the label, the icon and a radio that reports its selection', () => {
    render(
      <CheckInOption
        state={CHECK_IN_STATES.ANXIOUS}
        label="Ansiosa"
        isSelected
        onPress={() => {}}
      />,
    )

    const radio = screen.getByRole('radio', { name: 'Ansiosa' }) as HTMLInputElement

    expect(radio.checked).toBe(true)
    expect(radio.type).toBe('radio')
    expect(screen.getByText('Ansiosa')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.EMOTION_ICON)).toBeTruthy()
    expect(screen.getByTestId(`${TEST_IDS.CHECK_IN_OPTION_PREFIX}anxious`).contains(radio)).toBe(
      true,
    )
    expect(screen.getByTestId(TEST_IDS.CHECK_IN_OPTION_BORDER)).toBeTruthy()
  })

  it('has no selection border while unselected and calls onPress', () => {
    const onPress = vi.fn()
    render(
      <CheckInOption
        state={CHECK_IN_STATES.OTHER}
        label="Outro"
        isSelected={false}
        onPress={onPress}
      />,
    )

    expect(screen.queryByTestId(TEST_IDS.CHECK_IN_OPTION_BORDER)).toBeNull()
    expect((screen.getByRole('radio', { name: 'Outro' }) as HTMLInputElement).checked).toBe(false)

    fireEvent.click(screen.getByRole('radio', { name: 'Outro' }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('paints the tile with the color of its state', () => {
    render(
      <CheckInOption
        state={CHECK_IN_STATES.HEAVY}
        label="Pesada"
        isSelected={false}
        onPress={() => {}}
      />,
    )

    expect(
      screen.getByTestId(`${TEST_IDS.CHECK_IN_OPTION_PREFIX}heavy`).style.backgroundColor,
    ).toBe('rgb(231, 237, 253)')
  })
})

describe('CheckInOption as a group', () => {
  it('shares one radio group name, so the arrow keys move between the tiles', () => {
    render(
      <>
        <CheckInOption state={CHECK_IN_STATES.HEAVY} label="Pesada" isSelected onPress={() => {}} />
        <CheckInOption
          state={CHECK_IN_STATES.ANXIOUS}
          label="Ansiosa"
          isSelected={false}
          onPress={() => {}}
        />
      </>,
    )

    const names = screen.getAllByRole('radio').map((radio) => radio.getAttribute('name'))

    expect(names).toEqual([CHECK_IN_RADIO_GROUP_NAME, CHECK_IN_RADIO_GROUP_NAME])
  })
})

describe('CheckInOption on a phone', () => {
  it('draws the tile in design units with its selection border', () => {
    setViewportWidth(390)
    render(
      <CheckInOption state={CHECK_IN_STATES.HEAVY} label="Pesada" isSelected onPress={() => {}} />,
    )

    const tile = screen.getByTestId(`${TEST_IDS.CHECK_IN_OPTION_PREFIX}heavy`)

    expect(screen.getByRole('radio', { name: 'Pesada' })).toBeTruthy()
    expect(tile.style.height).toContain('calc(')
    expect(screen.getByTestId(TEST_IDS.CHECK_IN_OPTION_BORDER)).toBeTruthy()
  })

  it('has no border while unselected', () => {
    setViewportWidth(390)
    render(
      <CheckInOption
        state={CHECK_IN_STATES.HEAVY}
        label="Pesada"
        isSelected={false}
        onPress={() => {}}
      />,
    )

    expect(screen.queryByTestId(TEST_IDS.CHECK_IN_OPTION_BORDER)).toBeNull()
  })
})

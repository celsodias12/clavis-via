import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { FilterChips } from './filter-chips.component'

const OPTIONS = [
  { key: 'all', label: 'Todos' },
  { key: 'emotions', label: 'Emoções' },
  { key: 'faith', label: 'Fé' },
]

describe('FilterChips', () => {
  it('renders every option and marks only the selected one', async () => {
    await render(<FilterChips options={OPTIONS} selectedKey="emotions" onSelect={jest.fn()} />)
    expect(screen.getByText('Todos')).toBeTruthy()
    expect(screen.getByText('Fé')).toBeTruthy()
    expect(screen.getByTestId(`${TEST_IDS.FILTER_CHIP_PREFIX}emotions`)).toHaveProp(
      'accessibilityState',
      { selected: true },
    )
    expect(screen.getByTestId(`${TEST_IDS.FILTER_CHIP_PREFIX}all`)).toHaveProp(
      'accessibilityState',
      { selected: false },
    )
  })

  it('reports the key of the pressed chip', async () => {
    const onSelect = jest.fn()
    await render(<FilterChips options={OPTIONS} selectedKey="all" onSelect={onSelect} />)
    await fireEvent.press(screen.getByText('Fé'))
    expect(onSelect).toHaveBeenCalledWith('faith')
  })

  it('scrolls horizontally without a scroll bar', async () => {
    await render(<FilterChips options={OPTIONS} selectedKey="all" onSelect={jest.fn()} />)
    expect(screen.getByTestId(TEST_IDS.FILTER_CHIPS)).toHaveProp('horizontal', true)
    expect(screen.getByTestId(TEST_IDS.FILTER_CHIPS)).toHaveProp(
      'showsHorizontalScrollIndicator',
      false,
    )
  })
})

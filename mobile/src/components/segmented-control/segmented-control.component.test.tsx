import { fireEvent, render, screen } from '@testing-library/react-native'
import { SegmentedControl } from './segmented-control.component'

const SEGMENTS = [
  { key: 'overview', label: 'Visão geral' },
  { key: 'content', label: 'Conteúdo' },
  { key: 'reflections', label: 'Reflexões' },
]

describe('SegmentedControl', () => {
  it('renders every segment with its test ID and marks only the selected one', async () => {
    await render(
      <SegmentedControl
        segments={SEGMENTS}
        selectedKey="content"
        onSelect={jest.fn()}
        variant="soft"
        testIDPrefix="plan-segment-"
      />,
    )
    for (const segment of SEGMENTS) {
      expect(screen.getByTestId(`plan-segment-${segment.key}`)).toBeTruthy()
      expect(screen.getByText(segment.label)).toBeTruthy()
    }
    expect(screen.getByTestId('plan-segment-content').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    )
    expect(screen.getByTestId('plan-segment-overview').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    )
  })

  it('reports the key of the pressed segment', async () => {
    const onSelect = jest.fn()
    await render(
      <SegmentedControl
        segments={SEGMENTS}
        selectedKey="overview"
        onSelect={onSelect}
        variant="soft"
      />,
    )
    await fireEvent.press(screen.getByText('Reflexões'))
    expect(onSelect).toHaveBeenCalledWith('reflections')
  })

  it('draws the outline variant without the underline', async () => {
    await render(
      <SegmentedControl
        segments={SEGMENTS}
        selectedKey="content"
        onSelect={jest.fn()}
        variant="outline"
        testIDPrefix="day-segment-"
      />,
    )
    expect(screen.getByTestId('day-segment-content').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    )
    expect(screen.getByText('Reflexões')).toBeTruthy()
    expect(screen.getByTestId('day-segment-content').children).toHaveLength(1)
  })

  it('draws the solid variant without the underline and with every segment as wide as its label', async () => {
    const onSelect = jest.fn()
    await render(
      <SegmentedControl
        segments={SEGMENTS}
        selectedKey="overview"
        onSelect={onSelect}
        variant="solid"
        testIDPrefix="emotions-segment-"
      />,
    )
    expect(screen.getByTestId('emotions-segment-overview').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    )
    expect(screen.getByTestId('emotions-segment-overview').children).toHaveLength(1)
    await fireEvent.press(screen.getByText('Conteúdo'))
    expect(onSelect).toHaveBeenCalledWith('content')
  })
})

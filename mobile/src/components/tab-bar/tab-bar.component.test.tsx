import { TAB_ROUTE_NAMES, TEST_IDS } from '@clavis-via/shared'
import { fireEvent, screen } from '@testing-library/react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { TabBar } from './tab-bar.component'

type TabBarProps = Parameters<typeof TabBar>[0]

const ROUTE_ORDER = [
  TAB_ROUTE_NAMES.HOME,
  TAB_ROUTE_NAMES.PLANS,
  TAB_ROUTE_NAMES.CONVERSATION,
  TAB_ROUTE_NAMES.JOURNEY,
]

function buildProps(focusedIndex: number, defaultPrevented = false) {
  const emit = jest.fn(() => ({ defaultPrevented }))
  const navigateToTab = jest.fn()
  const props = {
    state: {
      index: focusedIndex,
      routes: ROUTE_ORDER.map((name) => ({ key: `${name}-key`, name })),
    },
    emitter: { emit },
    navigateToTab,
    descriptors: {},
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  } as unknown as TabBarProps
  return { props, emit, navigateToTab }
}

describe('TabBar', () => {
  it('renders the four labels', async () => {
    await renderWithProviders(<TabBar {...buildProps(0).props} />)
    for (const label of ['Início', 'Planos', 'Conversa', 'Jornada']) {
      expect(screen.getByText(label)).toBeTruthy()
    }
  })

  it('exposes a test ID per item', async () => {
    await renderWithProviders(<TabBar {...buildProps(0).props} />)
    for (const name of ['home', 'plans', 'conversation', 'journey']) {
      expect(screen.getByTestId(`tab-bar-item-${name}`)).toBeTruthy()
    }
    expect(screen.getByTestId(TEST_IDS.TAB_BAR)).toBeTruthy()
  })

  it('marks only the focused route as selected', async () => {
    await renderWithProviders(<TabBar {...buildProps(1).props} />)
    expect(screen.getByTestId('tab-bar-item-plans').props.accessibilityState).toEqual({
      selected: true,
    })
    expect(screen.getByTestId('tab-bar-item-home').props.accessibilityState).toEqual({
      selected: false,
    })
  })

  it('draws every icon in its active and inactive form', async () => {
    const view = await renderWithProviders(<TabBar {...buildProps(0).props} />)
    for (let focusedIndex = 1; focusedIndex < ROUTE_ORDER.length; focusedIndex += 1) {
      await view.rerender(<TabBar {...buildProps(focusedIndex).props} />)
      expect(screen.getByTestId('tab-bar-item-home').props.accessibilityState).toEqual({
        selected: false,
      })
    }
  })

  it('skips a route that is not one of the four tabs', async () => {
    const { props } = buildProps(0)
    props.state.routes.push({
      key: 'extra-key',
      name: 'extra',
    } as (typeof props.state.routes)[number])
    await renderWithProviders(<TabBar {...props} />)
    expect(screen.queryByTestId('tab-bar-item-extra')).toBeNull()
    expect(screen.getByTestId('tab-bar-item-home')).toBeTruthy()
  })

  it('emits tabPress and navigates when an unfocused item is pressed', async () => {
    const { props, emit, navigateToTab } = buildProps(0)
    await renderWithProviders(<TabBar {...props} />)
    await fireEvent.press(screen.getByTestId('tab-bar-item-plans'))
    expect(emit).toHaveBeenCalledWith({
      type: 'tabPress',
      target: 'plans-key',
      canPreventDefault: true,
    })
    expect(navigateToTab).toHaveBeenCalledWith('plans-key')
  })

  it('does not navigate when the focused item is pressed', async () => {
    const { props, emit, navigateToTab } = buildProps(0)
    await renderWithProviders(<TabBar {...props} />)
    await fireEvent.press(screen.getByTestId('tab-bar-item-home'))
    expect(emit).toHaveBeenCalled()
    expect(navigateToTab).not.toHaveBeenCalled()
  })

  it('does not navigate when a listener prevents the default', async () => {
    const { props, navigateToTab } = buildProps(0, true)
    await renderWithProviders(<TabBar {...props} />)
    await fireEvent.press(screen.getByTestId('tab-bar-item-journey'))
    expect(navigateToTab).not.toHaveBeenCalled()
  })
})

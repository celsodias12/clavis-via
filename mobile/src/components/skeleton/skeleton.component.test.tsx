import { render, screen } from '@testing-library/react-native'
import { StyleSheet, useWindowDimensions } from 'react-native'
import { SKELETON_METRICS } from '../../constants/component.constant'
import { Skeleton } from './skeleton.component'

// The native Reanimated runtime does not exist under jest: use the shared synchronous stand-in.
jest.mock(
  'react-native-reanimated',
  () => require('../../../tests/utils/reanimated-mock').reanimatedModule,
)

describe('Skeleton', () => {
  it('renders a labelled block sized from design units', async () => {
    let screenWidth = 0
    function Probe() {
      screenWidth = useWindowDimensions().width
      return <Skeleton width={100} height={20} radius={10} />
    }
    await render(<Probe />)
    const block = screen.getByLabelText('Carregando')
    const style = StyleSheet.flatten(block.props.style)
    expect(style.width).toBeCloseTo(screenWidth * (100 / 266), 5)
    expect(style.height).toBeCloseTo(screenWidth * (20 / 266), 5)
    expect(style.borderRadius).toBeCloseTo(screenWidth * (10 / 266), 5)
    expect(block.props.accessibilityRole).toBe('progressbar')
  })

  it('fills the width and uses the default radius when omitted', async () => {
    await render(<Skeleton height={20} />)
    expect(screen.getByLabelText('Carregando')).toHaveStyle({ width: '100%' })
  })

  it('starts at full opacity and pulses down to the minimum', async () => {
    const reanimated = jest.requireMock('react-native-reanimated')
    const withTiming = jest.spyOn(reanimated, 'withTiming')
    const withRepeat = jest.spyOn(reanimated, 'withRepeat')

    await render(<Skeleton height={20} />)

    expect(screen.getByLabelText('Carregando')).toHaveStyle({
      opacity: SKELETON_METRICS.PULSE_MAXIMUM_OPACITY,
    })
    expect(withTiming).toHaveBeenCalledWith(SKELETON_METRICS.PULSE_MINIMUM_OPACITY, {
      duration: SKELETON_METRICS.PULSE_DURATION_MS,
    })
    expect(withRepeat).toHaveBeenCalledWith(SKELETON_METRICS.PULSE_MINIMUM_OPACITY, -1, true)
  })
})

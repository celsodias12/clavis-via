import { render, screen } from '@testing-library/react-native'
import { useWindowDimensions } from 'react-native'
import { WaveBackground } from './wave-background.component'

describe('WaveBackground', () => {
  it('pins an undistorted image to the bottom with the measured color above it', async () => {
    let screenWidth = 0
    function Probe() {
      screenWidth = useWindowDimensions().width
      return <WaveBackground />
    }
    await render(<Probe />)
    const imageHeight = (screenWidth * 560) / 266
    expect(
      screen.getByTestId('wave-background-image', { includeHiddenElements: true }),
    ).toHaveStyle({
      width: screenWidth,
      height: imageHeight,
      bottom: 0,
    })
    expect(screen.getByTestId('wave-background-top', { includeHiddenElements: true })).toHaveStyle({
      backgroundColor: '#f5f2fc',
      bottom: imageHeight,
    })
  })

  it('fades the top color into the image over its first 24 design units', async () => {
    let screenWidth = 0
    function Probe() {
      screenWidth = useWindowDimensions().width
      return <WaveBackground />
    }
    await render(<Probe />)
    const imageHeight = (screenWidth * 560) / 266
    const fadeHeight = (screenWidth * 24) / 266
    const fade = screen.getByTestId('wave-background-fade', { includeHiddenElements: true })
    expect(fade.props.height).toBeCloseTo(fadeHeight, 5)
    expect(fade).toHaveStyle({ position: 'absolute', bottom: imageHeight - fadeHeight })
  })

  it('is decorative for accessibility and does not intercept touches', async () => {
    await render(<WaveBackground />)
    const container = screen.getByTestId('wave-background', { includeHiddenElements: true })
    expect(container.props.importantForAccessibility).toBe('no-hide-descendants')
    expect(container.props.pointerEvents).toBe('none')
  })
})

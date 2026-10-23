import { render, screen } from '@testing-library/react-native'
import { useWindowDimensions } from 'react-native'
import { BrandKey } from './brand-key.component'

describe('BrandKey', () => {
  it('renders the key scaled from a design width and hides it from accessibility', async () => {
    let screenWidth = 0
    function Probe() {
      screenWidth = useWindowDimensions().width
      return <BrandKey width={46} />
    }
    await render(<Probe />)
    const key = screen.getByTestId('brand-key', { includeHiddenElements: true })
    const width = screenWidth * (46 / 266)
    expect(key.props.width).toBeCloseTo(width, 5)
    expect(key.props.height).toBeCloseTo((width * 80) / 46, 5)
    expect(key.props.importantForAccessibility).toBe('no-hide-descendants')
  })
})

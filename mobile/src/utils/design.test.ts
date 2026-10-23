import { bottomFromDesign, scaleDesignValue, topFromDesign } from './design'

// Pixel 8: 412 dp wide.
const PIXEL_8_WIDTH = 412

describe('design scale', () => {
  it('scales design values by screen width / card width', () => {
    expect(scaleDesignValue(266, PIXEL_8_WIDTH)).toBe(412)
    expect(scaleDesignValue(40, PIXEL_8_WIDTH)).toBeCloseTo(61.955, 3)
  })

  it('positions from the top relative to the status bar', () => {
    expect(topFromDesign(30, 24, PIXEL_8_WIDTH)).toBe(24)
    expect(topFromDesign(130, 24, PIXEL_8_WIDTH)).toBeCloseTo(178.887, 3)
  })

  it('positions from the bottom relative to the card height', () => {
    expect(bottomFromDesign(492, 24, PIXEL_8_WIDTH)).toBeCloseTo(129.323, 3)
  })
})

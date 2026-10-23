import { describe, expect, it } from 'vite-plus/test'
import { designBottom, designTop, designUnits, lineBox } from './design'

describe('design units', () => {
  it('scales a value with the card and falls back to px', () => {
    expect(designUnits(12)).toBe('calc(var(--design-unit, 1.5px) * 12)')
  })

  it('measures the top from below the design status bar', () => {
    expect(designTop(112)).toBe(designUnits(82))
  })

  it('measures the bottom from the design card bottom', () => {
    expect(designBottom(452)).toBe(designUnits(108))
  })

  it('sizes a line box from the font metrics', () => {
    expect(lineBox(10, 1, 0.5)).toBe(designUnits(15))
  })
})

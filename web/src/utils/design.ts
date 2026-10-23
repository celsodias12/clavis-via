import { DESIGN } from '@clavis-via/shared'
import { DESIGN_UNIT_FALLBACK, DESIGN_UNIT_VARIABLE } from '../constants/design.constant'

// A length of `value` design units: it scales with the card around it (see WaveCard) and falls back to px.
export function designUnits(value: number): string {
  return `calc(var(${DESIGN_UNIT_VARIABLE}, ${DESIGN_UNIT_FALLBACK}) * ${value})`
}

// Distance from the card top of an element whose design y is `designY` (the status bar is not drawn on the web).
export function designTop(designY: number): string {
  return designUnits(designY - DESIGN.STATUS_BAR_HEIGHT)
}

// Distance from the card bottom of an element whose bottom edge is at design y `designBottomY`.
export function designBottom(designBottomY: number): string {
  return designUnits(DESIGN.CARD_HEIGHT - designBottomY)
}

// Height of a text line box whose font has the given ascent and descent (fractions of the font size).
export function lineBox(fontSize: number, ascent: number, descent: number): string {
  return designUnits((ascent + descent) * fontSize)
}

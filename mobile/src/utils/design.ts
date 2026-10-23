import { DESIGN } from '../constants/design.constant'

// Design scale: screen width / design card width, applied on both axes.
export function scaleDesignValue(designValue: number, screenWidth: number): number {
  return designValue * (screenWidth / DESIGN.CARD_WIDTH)
}

// Distance from the screen top: the status bar inset plus the scaled offset below the design status bar.
export function topFromDesign(designY: number, insetTop: number, screenWidth: number): number {
  return insetTop + scaleDesignValue(designY - DESIGN.STATUS_BAR_HEIGHT, screenWidth)
}

// Distance from the screen bottom: the navigation inset plus the scaled offset above the design card bottom.
export function bottomFromDesign(
  designBottomY: number,
  insetBottom: number,
  screenWidth: number,
): number {
  return insetBottom + scaleDesignValue(DESIGN.CARD_HEIGHT - designBottomY, screenWidth)
}

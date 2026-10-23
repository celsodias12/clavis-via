// The screens that follow the app's pixel design lay it out in design units (the 266 unit wide card). A card
// that scales with its own width defines this variable; outside one, a design unit is the fallback in px
// (a 390 px wide phone: 390 / 266).
export const DESIGN_UNIT_VARIABLE = '--design-unit'
export const DESIGN_UNIT_FALLBACK = '1.5px'

// One design unit as a share of the card width: the container query width unit of the card.
export const DESIGN_UNIT_CARD_VALUE = 'calc(100cqw / 266)'

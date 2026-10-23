// One path of an AppIcon (24 unit view box).
export type AppIconPath = Readonly<{
  d: string
  fill?: string
  stroke?: string
  strokeWidth?: number
}>

// Soft: touching segments with a pale pill and an underline on the selected one (Plano). Outline: separate
// pills, the selected one white with an outline (Dia). Solid: separate pale pills, the selected one filled with
// the accent and a white label (Minha jornada, Minhas emoções).
export type SegmentedControlVariant = 'soft' | 'outline' | 'solid'

// The inks of a list row: the menu of the Perfil, or the achievements of Minha jornada.
export type ListRowTone = 'menu' | 'achievement'

// The icons a screen header may carry on its left side.
export type ScreenHeaderLeftIcon = 'back' | 'close'

// The practice bar is thin with a knob at the end of the fill; the card bar (Início) is thicker, with no knob.
export type ProgressBarVariant = 'practice' | 'card'

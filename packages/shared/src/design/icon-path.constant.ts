// Arrow from the approved mockup (M31 58 L24 65 L31 72 M24.5 65 H40) moved into a 24 x 24 box;
// the X was measured on the Check-in reference (about 9.2 design units wide).
export const HEADER_ICON_PATHS = Object.freeze({
  BACK: 'M11 5 L4 12 L11 19 M4.5 12 H20',
  CLOSE: 'M7.4 7.4 L16.6 16.6 M16.6 7.4 L7.4 16.6',
  // Bell outline with its clapper (measured on the Início reference: ink 15.7 x 17.3 design units).
  // Magnifier (measured on the Planos reference: ink 13.7 x 13.7 design units): ring and handle.
  SEARCH: 'M10.5 3.3 A7.2 7.2 0 1 1 10.5 17.7 A7.2 7.2 0 1 1 10.5 3.3 M15.8 15.8 L21 21',
  // Chevron-only back arrow and the three dots of the Plano cover (measured on the Plano reference).
  CHEVRON_BACK: 'M15.5 5 L8 12 L15.5 19',
  MORE: 'M5 12 h0.01 M12 12 h0.01 M19 12 h0.01',
  BELL: 'M18 8 A6 6 0 0 0 6 8 C6 15 3 17 3 17 H21 S18 15 18 8 M13.73 21 A2 2 0 0 1 10.27 21',
  // Gear with six teeth and its center ring (measured on the Perfil reference: ink 13.3 x 13 design units).
  SETTINGS:
    'M12.22 2 h-0.44 a2 2 0 0 0 -2 2 v0.18 a2 2 0 0 1 -1 1.73 l-0.43 0.25 a2 2 0 0 1 -2 0 l-0.15 -0.08 a2 2 0 0 0 -2.73 0.73 l-0.22 0.38 a2 2 0 0 0 0.73 2.73 l0.15 0.1 a2 2 0 0 1 1 1.72 v0.51 a2 2 0 0 1 -1 1.74 l-0.15 0.09 a2 2 0 0 0 -0.73 2.73 l0.22 0.38 a2 2 0 0 0 2.73 0.73 l0.15 -0.08 a2 2 0 0 1 2 0 l0.43 0.25 a2 2 0 0 1 1 1.73 V20 a2 2 0 0 0 2 2 h0.44 a2 2 0 0 0 2 -2 v-0.18 a2 2 0 0 1 1 -1.73 l0.43 -0.25 a2 2 0 0 1 2 0 l0.15 0.08 a2 2 0 0 0 2.73 -0.73 l0.22 -0.39 a2 2 0 0 0 -0.73 -2.73 l-0.15 -0.08 a2 2 0 0 1 -1 -1.74 v-0.5 a2 2 0 0 1 1 -1.74 l0.15 -0.09 a2 2 0 0 0 0.73 -2.73 l-0.22 -0.38 a2 2 0 0 0 -2.73 -0.73 l-0.15 0.08 a2 2 0 0 1 -2 0 l-0.43 -0.25 a2 2 0 0 1 -1 -1.73 V4 a2 2 0 0 0 -2 -2 z M15 12 A3 3 0 1 1 9 12 A3 3 0 1 1 15 12',
})

// Stroke paths of the menu list icons (24 unit view box).
export const LIST_ROW_ICON_PATHS = Object.freeze({
  subscription:
    'M5 6 H19 a2 2 0 0 1 2 2 V19 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 V8 a2 2 0 0 1 2 -2 z M9 6 V4 a1 1 0 0 1 1 -1 h4 a1 1 0 0 1 1 1 V6 M8.8 11.6 C8.8 15.2 15.2 15.2 15.2 11.6',
  settings: HEADER_ICON_PATHS.SETTINGS,
  bell: HEADER_ICON_PATHS.BELL,
  lock: 'M6 11 H18 a2 2 0 0 1 2 2 v6 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 v-6 a2 2 0 0 1 2 -2 z M7.5 11 V7.5 a4.5 4.5 0 0 1 9 0 V11 M12 16 h0.01',
  help: 'M22 12 A10 10 0 1 1 2 12 A10 10 0 1 1 22 12 M9.1 9 a3 3 0 0 1 5.8 1 c0 2 -3 3 -3 3 M12 17 h0.01',
  logout: 'M9 21 H5 a2 2 0 0 1 -2 -2 V5 a2 2 0 0 1 2 -2 h4 M16 17 L21 12 L16 7 M21 12 H9',
  // The achievement icons of Minha jornada: a clipboard with a raised hand, a clipboard with a check, a speech
  // bubble with a target dot and a heart.
  handClipboard:
    'M5 10 H19 a2 2 0 0 1 2 2 V19 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 V12 a2 2 0 0 1 2 -2 z M9.5 15 V4.5 a1.5 1.5 0 0 1 3 0 V10 M7.5 15.5 h2 M15 15 h2',
  clipboardCheck:
    'M8.5 4.5 H5.5 a2 2 0 0 0 -2 2 V19.5 a2 2 0 0 0 2 2 h13 a2 2 0 0 0 2 -2 V6.5 a2 2 0 0 0 -2 -2 H15.5 M8.5 3 h7 v3 h-7 z M8 13.5 l3 3 l5 -5.5',
  target:
    'M12 3 a9 9 0 1 1 -4.5 16.8 L3.5 21 l1.2 -3.7 A9 9 0 0 1 12 3 z M15 12 a3 3 0 1 1 -6 0 a3 3 0 0 1 6 0',
  heart:
    'M12 20.5 C5 15 3 11.5 3 8.5 A4.5 4.5 0 0 1 12 6.5 A4.5 4.5 0 0 1 21 8.5 C21 11.5 19 15 12 20.5 z',
})

// Each icon is a body (outlined when inactive, filled when active) and a detail drawn on top of it
// (the lines of the document, the dots of the bubble); the active detail is white.
export const TAB_ICON_PATHS = Object.freeze({
  home: Object.freeze({
    outlineBody: 'M2.8 11.4 L12 3 L21.2 11.4 M5.4 9.6 V20.5 H9.6 V14.2 H14.4 V20.5 H18.6 V9.6',
    filledBody: 'M12 3 L22 12 H19.4 V20.5 H14.6 V14.4 H9.4 V20.5 H4.6 V12 H2 Z',
    detail: '',
  }),
  plans: Object.freeze({
    outlineBody:
      'M6.5 3 H17.5 A2.5 2.5 0 0 1 20 5.5 V18.5 A2.5 2.5 0 0 1 17.5 21 H6.5 A2.5 2.5 0 0 1 4 18.5 V5.5 A2.5 2.5 0 0 1 6.5 3 Z',
    filledBody:
      'M6.5 3 H17.5 A2.5 2.5 0 0 1 20 5.5 V18.5 A2.5 2.5 0 0 1 17.5 21 H6.5 A2.5 2.5 0 0 1 4 18.5 V5.5 A2.5 2.5 0 0 1 6.5 3 Z',
    detail: 'M7.8 9 H16.2 M7.8 15 H16.2',
  }),
  conversation: Object.freeze({
    outlineBody:
      'M12 3.5 C7 3.5 3 6.8 3 11 C3 13 4 14.8 5.6 16 L4.6 20.5 L9.2 18.6 C10.1 18.9 11 19 12 19 C17 19 21 15.7 21 11 C21 6.8 17 3.5 12 3.5 Z',
    filledBody:
      'M12 3.5 C7 3.5 3 6.8 3 11 C3 13 4 14.8 5.6 16 L4.6 20.5 L9.2 18.6 C10.1 18.9 11 19 12 19 C17 19 21 15.7 21 11 C21 6.8 17 3.5 12 3.5 Z',
    detail: 'M8.4 11.2 H8.5 M12 11.2 H12.1 M15.6 11.2 H15.7',
  }),
  journey: Object.freeze({
    outlineBody:
      'M3.5 20.5 V14.5 H7.5 V20.5 Z M10 20.5 V3.5 H14 V20.5 Z M16.5 20.5 V8.5 H20.5 V20.5 Z',
    filledBody:
      'M3.5 20.5 V14.5 H7.5 V20.5 Z M10 20.5 V3.5 H14 V20.5 Z M16.5 20.5 V8.5 H20.5 V20.5 Z',
    detail: '',
  }),
})

// Stroke paths (24 unit view box) of the calendar icon and of the check inside a day.
export const JOURNEY_ICON_PATHS = Object.freeze({
  CALENDAR:
    'M5 5 H19 a2 2 0 0 1 2 2 V19 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 V7 a2 2 0 0 1 2 -2 z M8 2.5 V6.5 M16 2.5 V6.5 M3 10 H21 M10.5 14.5 H13.5',
  CHECK: 'M5 12.5 L10 17.5 L19 7',
})

// Arrow after the label of a primary button (24 unit view box).
export const BUTTON_ARROW_PATH = 'M2 12 H22 M14 4.1 L22 12 L14 19.9'

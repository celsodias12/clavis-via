// Placeholder ambient loop of the practices (about 30 s, the same file as the app).
export const PRACTICE_AUDIO_URL = '/audio/practice-ambient.m4a'

// Id of the gradient of the play disc in its SVG.
export const PRACTICE_PLAY_GRADIENT_ID = 'practice-play-gradient'

export const DOCUMENT_EVENTS = Object.freeze({
  VISIBILITY_CHANGE: 'visibilitychange',
})

export const DOCUMENT_VISIBILITY_STATES = Object.freeze({
  HIDDEN: 'hidden',
})

// Height of the wave view box (the app cuts the same shapes at this height).
export const PRACTICE_WAVES_VIEW_BOX_HEIGHT = 101.7

export const PRACTICE_CLASSES = Object.freeze({
  // A column as tall as the window on a phone; a centered panel from 768 px.
  SCREEN: 'relative flex min-h-svh flex-col bg-practice-background md:min-h-0 md:bg-transparent',
  PANEL_WRAPPER:
    'flex flex-1 flex-col md:mx-auto md:w-full md:max-w-[640px] md:flex-none md:px-6 md:pt-6 md:pb-14',
  PANEL:
    'relative flex flex-1 flex-col overflow-hidden md:flex-none md:rounded-[32px] md:bg-practice-background md:shadow-[0_1px_10px_var(--color-plan-card-shadow)]',
  WAVES: 'pointer-events-none absolute inset-x-0 bottom-0 h-[140px] w-full md:h-[180px]',
  HEADER: 'relative z-10 px-4 md:px-6',
  CONTENT:
    'relative z-10 flex flex-1 flex-col px-6 pt-3 pb-10 md:flex-none md:px-12 md:pt-8 md:pb-56',
  TOP_BLOCK: 'flex flex-col items-center',
  ICON_CIRCLE:
    'flex size-[72px] items-center justify-center rounded-full bg-practice-icon-circle md:size-24',
  ICON: 'h-8 w-[38px] md:h-10 md:w-12',
  TITLE:
    'm-0 mt-4 text-center font-title text-[26px] leading-tight font-medium text-home-heading md:mt-6 md:text-[34px]',
  DURATION: 'm-0 mt-1.5 text-center font-body text-base text-practice-subtitle md:text-lg',
  DESCRIPTION:
    'm-0 mt-3 max-w-[340px] text-center font-body text-base leading-relaxed text-practice-description md:mt-4 md:max-w-[460px] md:text-lg',
  // The player sits at the bottom of a phone screen; on a wide screen it follows the description.
  BOTTOM_BLOCK: 'mt-auto flex flex-col items-center pt-8 md:mt-0 md:pt-10',
  MESSAGE: 'm-0 mb-3 text-center font-body text-base text-practice-subtitle md:text-lg',
  PLAY_BUTTON:
    'mb-5 flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-practice-icon',
  PLAY_SIZE: 88,
  PROGRESS_ROW: 'flex w-full items-center gap-3 px-1 md:px-4',
  LABEL: 'min-w-10 font-body text-sm text-practice-label tabular-nums md:text-base',
  LABEL_END: 'text-right',
  ERROR_BLOCK: 'mt-10',
  SKELETON_CIRCLE: 'size-[72px] rounded-full md:size-24',
  SKELETON_TITLE: 'mt-4 h-8 w-56 rounded-lg md:mt-6',
  SKELETON_LINE: 'mt-3 h-5 w-72 max-w-full rounded-md',
  SKELETON_KEYS: Object.freeze(['first', 'second', 'third']),
})

// The thin practice bar: a track with a fill and a knob at the end of the fill.
export const PRACTICE_PROGRESS_BAR_CLASSES = Object.freeze({
  ROOT: 'relative flex h-3 w-full items-center',
  TRACK: 'block h-1.5 w-full overflow-hidden rounded-full bg-practice-track',
  FILL: 'block h-full rounded-full bg-practice-fill',
  KNOB: 'absolute top-1/2 block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-practice-knob',
})

// Classes and metrics of the Dia screen and of the pieces it is made of.
export const PLAN_DAY_CLASSES = Object.freeze({
  SCREEN: 'relative min-h-svh bg-plan-sheet-background md:min-h-0 md:bg-transparent',
  // A column as tall as the window on a phone, so the Anterior / Próximo row stays at the bottom.
  PAGE: 'mx-auto flex min-h-svh w-full max-w-[880px] flex-col px-4 md:min-h-0 md:px-10 md:pt-8 md:pb-14',
  BODY: 'flex-1',
  TITLE:
    'm-0 mt-2 font-title text-[26px] leading-tight font-medium text-home-heading md:mt-6 md:text-[40px]',
  SEGMENTS: 'mt-5 md:mt-8',
  PANEL: 'mt-5 md:mt-8',
  // The video on the left and the message of the day on the right from 1024 px.
  CONTENT: 'flex flex-col gap-5 lg:grid lg:grid-cols-[55fr_45fr] lg:items-start lg:gap-10',
  MESSAGE_TITLE:
    'm-0 font-title text-[20px] leading-snug font-medium text-home-heading md:text-[26px]',
  MESSAGE_BODY: 'm-0 mt-2 font-body text-base text-body md:text-lg md:leading-relaxed',
  TEXT: 'm-0 font-body text-base text-body md:max-w-[680px] md:text-xl md:leading-relaxed',
  ACTION_BUTTON: 'mt-5 md:mt-8 md:max-w-[320px]',
  // Pinned to the bottom of the window on a phone; right after the content from 768 px.
  FOOTER:
    'sticky bottom-0 z-10 -mx-4 mt-6 flex items-center gap-3 bg-plan-sheet-background px-4 py-3 md:static md:mx-0 md:mt-10 md:max-w-[420px] md:bg-transparent md:p-0',
  PREVIOUS:
    'flex h-12 w-[130px] shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full border-0 bg-day-previous-button pr-3 font-body text-base font-medium text-body transition-colors hover:bg-day-previous-button/70 disabled:cursor-default disabled:opacity-55 disabled:hover:bg-day-previous-button',
  NEXT: 'min-w-0 flex-1',
  CHEVRON_SIZE: 24,
  SKELETONS: 'mt-6 flex flex-col gap-4',
  SKELETON_TITLE: 'h-9 w-3/4 rounded-lg',
  SKELETON_SEGMENTS: 'h-11 w-full max-w-[420px] rounded-full',
  SKELETON_VIDEO: 'aspect-[210/108] w-full rounded-[20px]',
  SKELETON_LINE: 'h-5 w-full rounded-md',
  SKELETON_KEYS: Object.freeze(['first', 'second', 'third']),
})

export const SCREEN_HEADER_CLASSES = Object.freeze({
  ROW: 'grid h-14 grid-cols-[44px_1fr_44px] items-center md:h-16',
  TITLE: 'm-0 text-center font-title text-lg font-medium text-home-heading md:text-xl',
  SLOT: 'flex items-center justify-center',
})

export const VIDEO_PLACEHOLDER_CLASSES = Object.freeze({
  CONTAINER:
    'relative aspect-[210/108] w-full overflow-hidden rounded-[20px] bg-plan-day-circle shadow-[0_1px_8px_var(--color-plan-card-shadow)]',
  COVER: 'absolute inset-0 size-full object-cover',
  PLAY: 'absolute top-1/2 left-1/2 flex size-[68px] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-white md:size-20',
  CLOCK:
    'pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 md:bottom-4 md:left-4',
  CLOCK_TEXT: 'font-body text-sm font-semibold text-white md:text-base',
  CLOCK_SIZE: 18,
  // What the browser may assume about the rendered width of the cover.
  SIZES: '(min-width: 1024px) 440px, (min-width: 768px) 800px, 100vw',
})

// The cover of the video: the 1x and the @3x file and their widths in px.
export const DAY_VIDEO_COVER_FILES = Object.freeze({
  STANDARD: '/images/day-video-cover.png',
  HIGH: '/images/day-video-cover@3x.png',
  STANDARD_WIDTH: 210,
  HIGH_WIDTH: 840,
})

import { colors } from '@clavis-via/shared'
import type { ListRowTone } from '../@types/component.type'

// Classes and metrics of the Minha jornada screen and of the pieces it is made of.
export const JOURNEY_CLASSES = Object.freeze({
  PAGE: 'mx-auto w-full max-w-[1100px] px-4 pt-6 pb-10 md:px-10 md:pt-12',
  TITLE: 'm-0 font-title text-[28px] leading-tight font-medium text-home-heading md:text-[40px]',
  SEGMENTS: 'mt-5 md:mt-8',
  // The streak and the phrase stack on a phone and sit side by side from 1024 px.
  GRID: 'mt-5 grid items-stretch gap-4 md:mt-8 md:gap-6 lg:grid-cols-2',
  STATE: 'mt-8 flex flex-col items-center gap-4 text-center',
  STREAK_SKELETON: 'h-[145px] rounded-[20px] md:h-[200px] md:rounded-[28px]',
  PHRASE_SKELETON: 'hidden h-[200px] rounded-[28px] lg:block',
  ACHIEVEMENTS:
    'mt-8 scroll-mt-6 md:mt-10 md:rounded-[28px] md:bg-home-card-background md:p-6 md:shadow-[0_1px_8px_var(--color-plan-card-shadow)]',
  ACHIEVEMENTS_HEADER: 'flex items-baseline justify-between gap-4',
  ACHIEVEMENTS_TITLE:
    'm-0 font-title text-xl leading-tight font-medium text-home-heading md:text-2xl',
  VIEW_ALL:
    'cursor-pointer border-0 bg-transparent p-0 font-title text-base font-medium text-journey-link underline md:text-lg',
  LIST: 'mt-2 md:mt-4',
  EMPTY: 'm-0 mt-4 font-body text-base text-body md:text-lg',
  SKELETON_ROWS: 'mt-4 flex flex-col gap-3',
  SKELETON_ROW: 'h-12 rounded-[10px] md:h-14 md:rounded-xl',
  SKELETON_KEYS: Object.freeze(['first', 'second', 'third']),
})

export const STREAK_CARD_CLASSES = Object.freeze({
  SHADOW:
    'h-full rounded-[20px] shadow-[0_2px_8px_var(--color-plan-card-shadow)] md:rounded-[28px]',
  CARD: 'relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-[20px] p-4 min-[380px]:p-5 md:gap-10 md:rounded-[28px] md:p-8',
  HEADLINE: 'flex items-baseline gap-3 pr-14',
  NUMBER: 'm-0 font-title text-[44px] leading-none font-medium text-home-heading md:text-[64px]',
  LABEL: 'font-body text-base font-medium text-home-card-label md:text-xl',
  CALENDAR:
    'absolute top-3 right-3 flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 transition-colors hover:bg-white/50 md:top-5 md:right-5',
  DAYS: 'flex justify-between gap-1',
  DAY: 'flex flex-1 flex-col items-center gap-2',
  DOT: 'flex size-8 items-center min-[380px]:size-9 justify-center rounded-full md:size-12',
  DOT_DONE: 'bg-emotions-segment-solid',
  DOT_EMPTY: 'border border-journey-day-empty-ring',
  DAY_LABEL: 'font-body text-sm font-medium text-journey-day-label md:text-base',
  CALENDAR_SIZE: 24,
  CHECK_SIZE: 18,
  CALENDAR_ICON_STROKE_WIDTH: 1.6,
  CHECK_ICON_STROKE_WIDTH: 2.4,
})

export const PHRASE_CARD_CLASSES = Object.freeze({
  CARD: 'flex h-full items-stretch gap-4 rounded-[20px] bg-home-card-background p-3 shadow-[0_2px_8px_var(--color-plan-card-shadow)] md:gap-6 md:rounded-[28px] md:p-5',
  TILE: 'flex w-[76px] shrink-0 items-center justify-center rounded-2xl md:w-[132px] md:rounded-3xl',
  ILLUSTRATION: 'h-auto w-[54px] md:w-[84px]',
  TEXT: 'm-0 flex-1 self-center font-body text-lg leading-snug text-body md:text-[26px] md:leading-snug',
})

// The leaf next to the phrase: the 1x file is 35 px wide and the @3x one 140 px wide.
export const JOURNEY_PHRASE_IMAGE = Object.freeze({
  SOURCE: '/images/journey-phrase-illustration.png',
  SOURCE_SET:
    '/images/journey-phrase-illustration.png 35w, /images/journey-phrase-illustration@3x.png 140w',
  SIZES: '(min-width: 768px) 84px, 54px',
  INTRINSIC_WIDTH: 35,
  INTRINSIC_HEIGHT: 33,
})

// The streak card and the tile of the phrase run their gradients at this angle.
export const JOURNEY_GRADIENT_ANGLE = '45deg'
export const GRADIENT_PERCENT = 100

export const LIST_ROW_CLASSES = Object.freeze({
  ROW: 'relative flex min-h-14 w-full cursor-pointer items-center gap-4 border-0 bg-transparent px-1 py-3 text-left transition-colors hover:bg-pill-background/40 focus-visible:outline-2 focus-visible:outline-plan-accent disabled:cursor-default disabled:opacity-55 disabled:hover:bg-transparent md:px-3',
  LABEL: 'min-w-0 flex-1 font-body text-base font-medium md:text-lg',
  DIVIDER: 'pointer-events-none absolute right-0 bottom-0 left-12 h-px bg-profile-divider',
  ICON_SIZE: 28,
  CHEVRON_SIZE: 20,
})

// The label color of each tone (a class) and the strokes of its icon and arrow.
export const LIST_ROW_TONES = Object.freeze({
  menu: Object.freeze({
    LABEL: 'text-title',
    ICON_COLOR: colors.profileRowIcon,
    CHEVRON_COLOR: colors.profileChevron,
  }),
  achievement: Object.freeze({
    LABEL: 'text-journey-achievement-label',
    ICON_COLOR: colors.journeyAchievementIcon,
    CHEVRON_COLOR: colors.journeyAchievementChevron,
  }),
} satisfies Record<
  ListRowTone,
  Readonly<{ LABEL: string; ICON_COLOR: string; CHEVRON_COLOR: string }>
>)

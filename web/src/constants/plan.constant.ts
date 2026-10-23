import type { SVGProps } from 'react'

// Classes and metrics of the Planos and Plano screens and of the pieces they are made of.
export const PLANS_CLASSES = Object.freeze({
  PAGE: 'mx-auto w-full max-w-[1100px] px-4 pt-6 pb-10 md:px-10 md:pt-12',
  HEADER: 'flex items-start justify-between gap-6',
  TITLE: 'm-0 font-title text-[28px] leading-tight font-medium text-home-heading md:text-[40px]',
  CHIPS: 'mt-5 md:mt-8',
  // One column on a phone, two from 768 px and three from 1024 px.
  GRID: 'mt-6 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-2 md:gap-6 lg:grid-cols-3',
  STATE: 'mt-8 flex flex-col items-center gap-4 text-center',
  EMPTY_MESSAGE: 'm-0 font-body text-base text-body md:text-lg',
  NOTE: 'm-0 mt-8 text-center font-body text-sm text-placeholder',
  CARD_SKELETON: 'h-24 rounded-[20px] md:h-[280px]',
  SKELETON_KEYS: Object.freeze(['first', 'second', 'third', 'fourth', 'fifth']),
})

export const FILTER_CHIPS_CLASSES = Object.freeze({
  // A phone scrolls the row sideways under the page margin; wider screens wrap it.
  ROW: '-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0',
  CHIP: 'h-10 shrink-0 cursor-pointer rounded-full border-0 px-5 font-body text-base transition-colors',
  SELECTED: 'bg-primary-accent font-semibold text-white',
  UNSELECTED: 'bg-pill-background font-medium text-body hover:bg-pill-background/70',
})

export const PLAN_CARD_CLASSES = Object.freeze({
  // A row (photo, text, arrow) on a phone; a column (photo on top) from 768 px.
  CARD: 'group flex w-full cursor-pointer items-stretch overflow-hidden rounded-[20px] border-0 bg-home-background p-0 text-left shadow-[0_1px_8px_var(--color-plan-card-shadow)] transition duration-200 hover:shadow-[0_8px_24px_var(--color-plan-card-shadow)] focus-visible:outline-2 focus-visible:outline-plan-accent md:flex-col md:hover:-translate-y-1',
  PICTURE: 'flex shrink-0 self-stretch md:block md:self-auto',
  PHOTO:
    'w-28 shrink-0 self-stretch object-cover transition-transform duration-300 md:aspect-[219/163] md:w-full md:self-auto md:group-hover:scale-105',
  TEXT: 'flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3 md:p-5',
  TITLE: 'font-title text-lg leading-snug font-medium text-home-heading md:text-xl',
  DURATION: 'font-body text-base text-title',
  CHEVRON: 'mr-4 shrink-0 self-center md:hidden',
  // The thumbnail fills the phone row; from 768 px the picture switches to the cover photo.
  PHOTO_SIZES: '112px',
  COVER_MEDIA: '(min-width: 768px)',
  // What the browser may assume about the rendered width of the cover (the card of the 3 / 2 column grid).
  COVER_SIZES: '(min-width: 1024px) 340px, 460px',
})

export const PLAN_DETAIL_CLASSES = Object.freeze({
  SCREEN: 'relative min-h-svh bg-plan-sheet-background md:min-h-0 md:bg-transparent',
  PAGE: 'mx-auto w-full max-w-[1100px] pb-10 md:px-10 md:pt-8 md:pb-14',
  // Over the cover on a phone; a header row above the content from 768 px.
  HEADER:
    'absolute inset-x-0 top-0 z-10 flex items-center justify-between px-2 pt-3 md:static md:px-0 md:pt-0 md:pb-5',
  HEADER_BUTTON: 'rounded-full bg-white/70 md:bg-transparent',
  // The cover on the left and the rest on the right from 1024 px.
  COLUMNS: 'lg:grid lg:grid-cols-2 lg:items-start lg:gap-12',
  // The cover is the full width on a phone and half of the page from 1024 px.
  COVER_SIZES: '(min-width: 1024px) 486px, 100vw',
  COVER: 'block aspect-[219/163] w-full object-cover md:rounded-3xl lg:sticky lg:top-8',
  SHEET:
    'relative -mt-6 min-w-0 rounded-t-[28px] bg-plan-sheet-background px-4 pt-6 md:mt-8 md:rounded-none md:bg-transparent md:px-0 md:pt-0 lg:mt-0',
  TITLE: 'm-0 font-title text-[26px] leading-tight font-medium text-home-heading md:text-[40px]',
  META: 'mt-3 flex flex-wrap items-center gap-x-5 gap-y-2',
  META_ITEM: 'flex items-center gap-2 font-body text-base font-medium text-title',
  DESCRIPTION: 'm-0 mt-4 font-body text-base text-body md:text-lg md:leading-relaxed',
  SEGMENTS: 'mt-6 md:mt-8',
  PANEL: 'mt-4 flex flex-col gap-3 md:mt-6',
  DAY_LIST:
    'overflow-hidden rounded-[20px] bg-home-background shadow-[0_1px_8px_var(--color-plan-card-shadow)]',
  ITEM: 'flex flex-col gap-1 rounded-[20px] bg-home-background p-5 shadow-[0_1px_8px_var(--color-plan-card-shadow)]',
  ITEM_TITLE: 'm-0 font-body text-base font-semibold text-home-heading',
  ITEM_DATE: 'm-0 font-body text-sm text-placeholder',
  ITEM_BODY: 'm-0 font-body text-base text-body',
  REFLECTIONS_EMPTY: 'm-0 font-body text-base text-body',
  // Pinned to the bottom of the viewport on a phone; right after the list from 768 px.
  FOOTER:
    'sticky bottom-0 z-10 -mx-4 mt-6 bg-plan-sheet-background px-4 py-3 md:static md:mx-0 md:mt-8 md:max-w-[420px] md:bg-transparent md:p-0',
  SKELETONS: 'flex flex-col gap-3',
  SKELETON_TITLE: 'h-9 w-3/4 rounded-lg',
  SKELETON_ROW: 'h-[72px] rounded-[20px]',
  SKELETON_KEYS: Object.freeze(['first', 'second', 'third']),
})

export const SEGMENTED_CONTROL_CLASSES = Object.freeze({
  UNDERLINE: 'pointer-events-none absolute inset-x-6 -bottom-px h-0.5 rounded-full bg-plan-accent',
})

// The classes of each variant: the row, a segment and the selected and unselected states of a segment.
export const SEGMENTED_CONTROL_VARIANT_CLASSES = Object.freeze({
  // Touching segments, a pale pill and an underline on the selected one.
  soft: Object.freeze({
    ROW: 'flex flex-wrap items-center',
    SEGMENT:
      'relative h-11 cursor-pointer rounded-full border-0 px-5 font-body text-base transition-colors',
    SELECTED: 'bg-plan-segment-pill font-semibold text-plan-accent',
    UNSELECTED: 'bg-transparent font-medium text-body hover:bg-plan-segment-pill/50',
  }),
  // Separate pills, the selected one white with an outline.
  outline: Object.freeze({
    ROW: 'flex flex-wrap items-center gap-1.5 md:gap-2',
    SEGMENT:
      'h-10 cursor-pointer rounded-full border px-3 font-body text-sm transition-colors md:h-11 md:px-5 md:text-base',
    SELECTED: 'border-day-chip-outline bg-white font-semibold text-plan-accent',
    UNSELECTED:
      'border-transparent bg-pill-background font-medium text-body hover:bg-pill-background/70',
  }),
  // Separate pale pills, the selected one filled with the accent and a white label.
  solid: Object.freeze({
    ROW: 'flex flex-wrap items-center gap-1.5 md:gap-2',
    SEGMENT:
      'h-10 cursor-pointer rounded-full border-0 px-3 font-body text-[13px] transition-colors md:h-11 md:px-6 md:text-base',
    SELECTED: 'bg-emotions-segment-solid font-semibold text-white',
    UNSELECTED: 'bg-pill-background font-medium text-body hover:bg-pill-background/70',
  }),
})

export const PLAN_DAY_ROW_CLASSES = Object.freeze({
  ROW: 'relative flex w-full cursor-pointer items-center gap-4 border-0 bg-transparent px-4 py-3 text-left transition-colors hover:bg-plan-day-circle/30 md:px-5 md:py-4',
  CIRCLE:
    'flex size-11 shrink-0 items-center justify-center rounded-full bg-plan-day-circle font-body text-lg text-plan-accent',
  TEXT: 'flex min-w-0 flex-1 flex-col',
  LABEL: 'font-body text-base font-semibold text-home-heading',
  TITLE: 'truncate font-body text-base text-body',
  SEPARATOR: 'pointer-events-none absolute right-4 bottom-0 left-[76px] h-px bg-tab-bar-separator',
  CHEVRON: 'shrink-0',
})

// The icons of the meta row of the Plano screen.
export const PLAN_META_ICON_NAMES = Object.freeze({ CALENDAR: 'calendar', CLOCK: 'clock' })

// Attributes shared by every stroke of the meta icons (the width comes from the shared icon data).
export const PLAN_META_STROKE: Readonly<
  Pick<SVGProps<SVGElement>, 'fill' | 'strokeLinecap' | 'strokeLinejoin'>
> = Object.freeze({ fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' })

// Metrics (px) of the icons of these screens.
export const PLAN_ICON_METRICS = Object.freeze({
  CHEVRON_SIZE: 22,
  CHECK_SIZE: 22,
  META_SIZE: 20,
})

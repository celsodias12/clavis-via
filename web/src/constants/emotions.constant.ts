import { EMOTION_INSIGHT_KINDS, type EmotionInsightKind } from '@clavis-via/shared'

// Classes and metrics of the Minhas emoções screen and of the pieces it is made of.
export const EMOTIONS_CLASSES = Object.freeze({
  SCREEN: 'relative min-h-svh bg-plan-sheet-background md:min-h-0 md:bg-transparent',
  PAGE: 'mx-auto w-full max-w-[1100px] px-4 pb-10 md:px-10 md:pt-8 md:pb-14',
  BACK: '-ml-3',
  TITLE: 'm-0 mt-2 font-title text-[40px] leading-tight font-medium text-home-heading',
  SEGMENTS: 'mt-2 md:mt-8',
  CARD: 'mt-5 overflow-hidden rounded-[20px] bg-home-card-background pt-4 pb-4 shadow-[0_1px_8px_var(--color-plan-card-shadow)] md:mt-8 md:rounded-[28px] md:pt-8 md:pb-6',
  // The chart and the columns below it share the width of the card, so a point sits over its column.
  CHART: 'h-[160px] w-full md:h-[260px]',
  CHART_SKELETON: 'h-full w-full rounded-lg',
  COLUMNS: 'mt-2 flex md:mt-3',
  COLUMN: 'flex min-w-0 flex-1 flex-col items-center gap-1 md:gap-2',
  ICON_SLOT: 'flex size-7 items-center justify-center md:size-10',
  DAY_LABEL: 'font-body text-xs whitespace-nowrap text-body md:text-sm',
  EMPTY: 'flex flex-col items-center gap-3 px-6 py-10 text-center md:py-16',
  EMPTY_TEXT: 'm-0 font-body text-base text-body md:text-lg',
  EMPTY_BUTTON: 'w-full max-w-[280px]',
  HEADING:
    'm-0 mt-6 font-title text-xl leading-tight font-medium text-home-heading md:mt-10 md:text-2xl',
  // One column of rows on a phone (with their hairlines) and two columns of cards from 768 px.
  INSIGHTS: 'mt-2 grid md:mt-5 md:grid-cols-2 md:gap-4',
  NO_INSIGHTS: 'm-0 mt-3 font-body text-sm text-body md:text-base',
  ERROR: 'mt-8',
  SKELETONS: 'mt-5 flex flex-col gap-4 md:mt-8',
  CARD_SKELETON: 'h-[240px] rounded-[20px] md:h-[400px] md:rounded-[28px]',
  ROW_SKELETON: 'h-[72px] rounded-[20px]',
  SKELETON_KEYS: Object.freeze(['first', 'second', 'third']),
  ICON_SIZE_PHONE: '28px',
  ICON_SIZE_WIDE: '40px',
})

// The chart: the margin keeps the extreme scores and their dots inside the drawing, the dots are smaller in
// the month view, which has the most points.
export const EMOTION_CHART_METRICS = Object.freeze({
  MARGIN: Object.freeze({ top: 16, right: 0, bottom: 16, left: 0 }),
  LINE_WIDTH: 2,
  POINT_RADIUS: 5,
  MONTH_POINT_RADIUS: 3,
  HALF_COLUMN: 0.5,
  SCORE_KEY: 'score',
  POSITION_KEY: 'position',
})

export const INSIGHT_ROW_CLASSES = Object.freeze({
  ROW: 'relative flex items-center gap-4 py-3 md:rounded-[20px] md:bg-home-card-background md:p-5 md:shadow-[0_1px_8px_var(--color-plan-card-shadow)]',
  CIRCLE: 'flex size-12 shrink-0 items-center justify-center rounded-full md:size-14',
  TEXTS: 'min-w-0 flex-1',
  TITLE: 'm-0 font-body text-base font-semibold text-home-heading md:text-lg',
  TEXT: 'm-0 mt-0.5 font-body text-sm leading-relaxed text-body md:text-base',
  // The hairline of a phone list; the cards of the wide layout have none.
  DIVIDER:
    'pointer-events-none absolute right-0 bottom-0 left-16 h-px bg-profile-divider md:hidden',
  ICON_SIZE: 26,
})

export const INSIGHT_CIRCLE_CLASSES = Object.freeze({
  [EMOTION_INSIGHT_KINDS.BALANCED_DAYS]: 'bg-insight-balanced-circle',
  [EMOTION_INSIGHT_KINDS.LESS_ANXIETY]: 'bg-insight-anxiety-circle',
  [EMOTION_INSIGHT_KINDS.ROUTINE_HELPS]: 'bg-insight-routine-circle',
} satisfies Record<EmotionInsightKind, string>)

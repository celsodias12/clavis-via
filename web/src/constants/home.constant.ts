// Media files of the "Sua chave de hoje" illustration: 1x is the 56 px wide file, 3x the 224 px wide one.
export const DAILY_KEY_IMAGE = Object.freeze({
  SOURCE: '/images/daily-key-illustration.png',
  SOURCE_SET: '/images/daily-key-illustration.png 56w, /images/daily-key-illustration@3x.png 224w',
  // The picture is 82 px wide on a phone and 140 px wide from the wide breakpoint.
  SIZES: '(min-width: 768px) 140px, 82px',
  INTRINSIC_WIDTH: 56,
  INTRINSIC_HEIGHT: 118,
})

// Metrics (px) of the pieces drawn on the Início cards.
export const HOME_METRICS = Object.freeze({
  PHONE_KEY_WIDTH: 32,
  VERSE_BOOK_WIDTH: 36,
  PLAY_SIZE: 36,
  CHEVRON_HEIGHT: 18,
  PERCENT: 100,
})

export const HOME_CLASSES = Object.freeze({
  // The page: centered, as wide as a dashboard needs.
  PAGE: 'mx-auto w-full max-w-[1100px] px-4 pt-6 pb-10 md:px-10 md:pt-12',
  PHONE_HEADER: 'flex items-center justify-between',
  PHONE_BRAND: 'flex items-center gap-3',
  PHONE_BRAND_TEXT: 'font-brand text-lg font-light tracking-[0.2em] text-home-brand-text',
  PHONE_ACTIONS: 'flex items-center gap-1',
  PHONE_GREETING_BLOCK: 'mt-6',
  WIDE_HEADER: 'flex items-start justify-between gap-6',
  GREETING:
    'm-0 truncate font-title text-[28px] leading-tight font-medium text-home-heading md:text-[40px]',
  SUBTITLE: 'm-0 mt-1 font-body text-base text-body md:mt-2 md:text-lg',
  // One column up to the large breakpoint, then the key on the left and the other two cards stacked on the right.
  GRID: 'mt-6 grid gap-5 md:mt-10 md:gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]',
  SIDE_COLUMN: 'flex min-w-0 flex-col gap-5 md:gap-6',
  SLOT: 'min-w-0',
  // The key slot stretches to the height of the stacked column beside it.
  KEY_SLOT: 'h-full min-w-0',
  KEY_SKELETON: 'h-[242px] rounded-[20px] md:h-[380px] md:rounded-[28px]',
  VERSE_SKELETON: 'h-[140px] rounded-[20px] md:rounded-[28px]',
  PLAN_SKELETON: 'h-[120px] rounded-[20px] md:rounded-[28px]',
  AVATAR_BUTTON: 'cursor-pointer rounded-full',
})

export const DAILY_KEY_CARD_CLASSES = Object.freeze({
  SHADOW:
    'h-full rounded-[20px] shadow-[0_3px_18px_var(--color-daily-key-card-shadow)] md:rounded-[28px]',
  CARD: 'relative flex h-full min-h-[242px] gap-4 overflow-hidden rounded-[20px] p-5 md:min-h-[380px] md:gap-10 md:rounded-[28px] md:p-10',
  ILLUSTRATION: 'h-auto w-[82px] shrink-0 self-start md:w-[140px]',
  TEXT: 'flex min-w-0 flex-1 flex-col',
  LABEL: 'm-0 font-body text-sm font-medium tracking-[0.08em] text-home-card-label',
  TITLE:
    'm-0 mt-2 font-title text-2xl leading-tight font-medium text-home-heading md:mt-3 md:text-[36px]',
  BODY: 'm-0 mt-3 line-clamp-4 font-body text-base text-body md:mt-4 md:line-clamp-none md:text-lg md:leading-relaxed',
  BUTTON_SLOT: 'mt-auto pt-5 md:max-w-[300px] md:pt-8',
})

export const VERSE_CARD_CLASSES = Object.freeze({
  CARD: 'relative flex gap-4 rounded-[20px] bg-home-card-background p-5 shadow-[0_1px_8px_var(--color-home-card-shadow)] md:gap-5 md:rounded-[28px] md:p-7',
  TILE: 'flex size-14 shrink-0 items-center justify-center rounded-2xl bg-verse-tile md:size-16',
  TEXT: 'flex min-w-0 flex-1 flex-col',
  TITLE: 'm-0 font-title text-xl font-medium text-home-heading md:text-2xl',
  QUOTE: 'm-0 mt-2 line-clamp-3 font-body text-base text-body md:text-lg',
  FOOTER: 'mt-auto flex items-end justify-between gap-3 pt-2',
  REFERENCE: 'm-0 font-body text-sm text-body md:text-base',
  PLAY: 'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0',
})

export const CURRENT_PLAN_CARD_CLASSES = Object.freeze({
  CARD: 'flex w-full cursor-pointer items-center gap-4 rounded-[20px] border-0 bg-home-card-background p-5 text-left shadow-[0_1px_8px_var(--color-home-card-shadow)] md:rounded-[28px] md:p-7',
  TEXT: 'flex min-w-0 flex-1 flex-col',
  TITLE: 'm-0 font-title text-xl font-medium text-home-heading md:text-2xl',
  NAME: 'm-0 mt-1 truncate font-body text-base text-body md:text-lg',
  DAY: 'm-0 mt-1 font-body text-base font-medium text-body',
  BAR: 'mt-3',
  CHEVRON: 'shrink-0',
})

export const PROGRESS_BAR_CLASSES = Object.freeze({
  TRACK: 'block h-2 w-full overflow-hidden rounded-full bg-home-progress-track',
  FILL: 'block h-full rounded-full bg-home-progress-fill',
})

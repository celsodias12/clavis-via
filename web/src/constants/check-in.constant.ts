// The native radios of the eight tiles form one group by sharing this name.
export const CHECK_IN_RADIO_GROUP_NAME = 'check-in-state'

const TILE_FOCUS_RING = 'has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50'

export const CHECK_IN_CLASSES = Object.freeze({
  // Visually hidden but still focusable and read by assistive technology.
  RADIO: 'sr-only',
  // The native form wraps the content without a box of its own, so the layout is unchanged.
  FORM: 'contents',
  PAGE: 'min-h-svh bg-linear-to-b from-check-in-background-top to-check-in-background-bottom',
  CONTENT: 'mx-auto flex min-h-svh w-full max-w-[720px] flex-col px-6 pt-4 pb-8',
  TITLE: 'm-0 grid font-title font-medium text-title',
  SUBTITLE: 'm-0 grid font-body text-body',
  // Three tiles per row on a phone (the last row of two is centered) and four from the wide breakpoint.
  GRID: 'mt-8 flex flex-wrap justify-center gap-3',
  TILE_SLOT: 'basis-[calc((100%-1.5rem)/3)] md:basis-[calc((100%-2.25rem)/4)]',
  OTHER_FIELD: 'mt-6',
  ERROR: 'mt-4 mb-0 text-center font-body text-error',
  BUTTON_SLOT: 'mt-auto pt-8',
  OPTION: `relative flex w-full cursor-pointer flex-col items-center border-0 p-0 font-body text-title ${TILE_FOCUS_RING}`,
  OPTION_LABEL: 'absolute inset-x-0 text-center',
  OPTION_ICON: 'absolute inset-x-0 flex justify-center',
  OPTION_BORDER: 'pointer-events-none absolute inset-0 border-tile-selected-border',

  // Web layout from the wide screen breakpoint: one centered composition, the actions right after the content.
  WIDE_PAGE:
    'flex min-h-svh items-center justify-center bg-linear-to-b from-check-in-background-top to-check-in-background-bottom px-6 py-10',
  WIDE_CONTENT: 'flex w-full max-w-[880px] flex-col',
  WIDE_TITLE:
    'm-0 mt-2 grid text-center font-title text-[40px] leading-tight font-medium text-title',
  WIDE_SUBTITLE: 'm-0 mt-3 grid text-center font-body text-lg text-body',
  WIDE_GRID: 'mt-10 grid grid-cols-4 gap-4',
  WIDE_OTHER_FIELD: 'mx-auto mt-6 w-full max-w-[400px]',
  WIDE_ERROR: 'mt-4 mb-0 text-center font-body text-base text-error',
  WIDE_BUTTON_SLOT: 'mx-auto mt-8 w-full max-w-[400px]',
  WIDE_OPTION: `relative flex h-[150px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[28px] border-0 p-0 font-body text-[17px] text-title ${TILE_FOCUS_RING}`,
  WIDE_OPTION_ICON: 'size-16',
  WIDE_OPTION_BORDER:
    'pointer-events-none absolute inset-0 rounded-[28px] border-[2px] border-tile-selected-border',
})

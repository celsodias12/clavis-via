// Classes and metrics of the Ação do dia screen.
export const DAY_ACTION_CLASSES = Object.freeze({
  SCREEN: 'relative min-h-svh bg-plan-sheet-background md:min-h-0 md:bg-transparent',
  PAGE: 'mx-auto flex w-full max-w-[720px] flex-col px-4 pb-10 md:px-10 md:pt-8 md:pb-14',
  CARDS: 'mt-2 flex flex-col gap-3 md:mt-6 md:gap-4',
  ACTION_CARD:
    'relative rounded-2xl bg-day-action-card py-5 pr-4 pl-[68px] shadow-[0_1px_6px_var(--color-plan-card-shadow)] md:py-6 md:pr-6 md:pl-[84px]',
  CHECK: 'absolute top-4 left-4 size-9 md:top-5 md:left-6 md:size-10',
  ACTION_TEXT: 'm-0 font-body text-base leading-relaxed font-semibold text-home-heading md:text-lg',
  TIP_CARD: 'relative rounded-2xl bg-day-tip-card py-4 pr-4 pl-[56px] md:py-5 md:pr-6 md:pl-[68px]',
  TIP_ICON: 'absolute top-4 left-5 h-7 w-5 md:top-5 md:left-6 md:h-8 md:w-6',
  TIP_TITLE: 'm-0 font-body text-base font-semibold text-home-heading md:text-lg',
  TIP_TEXT: 'm-0 mt-1 font-body text-base leading-relaxed text-day-tip-text md:text-lg',
  // The native form wraps the reflection and the button without a box of its own.
  FORM: 'contents',
  REFLECTION: 'mt-6 md:mt-8',
  FOOTER: 'mt-5 flex flex-col gap-3 md:mt-6 md:max-w-[360px]',
  ERROR: 'm-0 text-center font-body text-base text-error md:text-left',
  SKELETON_ACTION_CARD: 'h-[88px] rounded-2xl',
  SKELETON_TIP_CARD: 'h-[104px] rounded-2xl',
  SKELETON_FIELD: 'h-32 rounded-2xl',
  SKELETON_BUTTON: 'h-[54px] rounded-full',
  CHECK_RADIUS: 12,
  CHECK_CENTER: 12,
})

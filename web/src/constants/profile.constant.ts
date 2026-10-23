// Classes and metrics of the Meu perfil screen.
export const PROFILE_CLASSES = Object.freeze({
  SCREEN: 'relative min-h-svh bg-plan-sheet-background md:min-h-0 md:bg-transparent',
  PAGE: 'mx-auto w-full max-w-[1100px] px-4 pb-10 md:px-10 md:pt-8 md:pb-14',
  HEADER_WIDE: 'flex items-center justify-between gap-4',
  TITLE: 'm-0 font-title text-[40px] leading-tight font-medium text-home-heading',
  // One column up to 1023 px; the profile and the purpose on the left and the menu on the right from 1024 px.
  GRID: 'mt-2 grid items-start gap-6 md:mt-8 lg:grid-cols-[2fr_3fr] lg:gap-8',
  LEFT: 'flex flex-col gap-6',
  PROFILE_CARD:
    'flex flex-col items-center px-4 pt-2 pb-2 text-center md:rounded-[28px] md:bg-profile-card md:px-8 md:py-10 md:shadow-[0_2px_8px_var(--color-plan-card-shadow)]',
  PHOTO: 'relative',
  BADGE:
    'absolute right-0 bottom-0 flex size-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white p-0 shadow-[0_1px_3px_var(--color-plan-card-shadow)] transition-colors hover:bg-pill-background focus-visible:outline-2 focus-visible:outline-plan-accent md:size-11',
  NAME: 'm-0 mt-4 max-w-full truncate font-title text-2xl font-medium text-home-heading md:text-[32px]',
  SUBTITLE: 'm-0 mt-1 font-body text-base text-practice-subtitle md:text-lg',
  PURPOSE:
    'flex items-center gap-4 rounded-[20px] bg-profile-card p-4 shadow-[0_2px_8px_var(--color-plan-card-shadow)] md:gap-5 md:rounded-[28px] md:p-6',
  PURPOSE_SQUARE:
    'flex size-14 shrink-0 items-center justify-center rounded-2xl bg-profile-square md:size-16',
  PURPOSE_TITLE: 'm-0 font-body text-base font-semibold text-home-heading md:text-lg',
  PURPOSE_TEXT: 'm-0 mt-1 font-body text-sm leading-relaxed text-body md:text-base',
  MENU: 'flex flex-col md:rounded-[28px] md:bg-profile-card md:px-4 md:py-3 md:shadow-[0_2px_8px_var(--color-plan-card-shadow)]',
  PHOTO_SIZE_PHONE: 88,
  PHOTO_SIZE_WIDE: 128,
  BADGE_ICON_SIZE: 20,
  PURPOSE_ICON_SIZE: 32,
})

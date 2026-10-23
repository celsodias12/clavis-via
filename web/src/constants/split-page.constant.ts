import type { TranslationKeys } from '@clavis-via/shared'

// Web layout of the entry screens (welcome, sign in, sign up) from the wide screen breakpoint up: a brand panel
// beside the content from 1024 px, a brand header above it below that.
export const SPLIT_PAGE_CLASSES = Object.freeze({
  PAGE: 'min-h-svh bg-white lg:grid lg:grid-cols-2',
  PANEL:
    'relative flex flex-col items-center justify-center gap-5 overflow-hidden bg-wave-top px-8 py-10 text-center lg:min-h-svh',
  // The image is portrait: it fills the panel width, is anchored to the bottom and only its plain top is cropped.
  IMAGE: 'absolute inset-0 hidden h-full w-full select-none object-cover object-bottom lg:block',
  BRAND: 'relative flex flex-col items-center gap-4',
  KEY: 'w-12 lg:w-16 [&>svg]:h-auto [&>svg]:w-full',
  CLAVIS: 'font-brand text-5xl font-light tracking-[0.35em] text-brand lg:text-7xl',
  VIA: 'font-brand text-3xl font-light tracking-[0.6em] text-brand lg:text-5xl',
  TAGLINE: 'relative m-0 hidden font-body text-xl text-body lg:block',
  CONTENT: 'flex flex-col justify-center px-6 py-10 lg:min-h-svh lg:py-12',
  COLUMN: 'mx-auto flex w-full max-w-[400px] flex-col',
})

export const WEB_PAGE_CLASSES = Object.freeze({
  HEADING: 'm-0 font-title text-[40px] leading-tight font-normal text-title',
  SUBTITLE: 'm-0 mt-3 font-body text-lg text-body',
  // The native form wraps the fields without a box of its own, so the column layout is unchanged.
  FORM: 'contents',
  BACK: 'mb-4 self-start',
  FIELDS: 'mt-8 flex flex-col gap-5',
  FORM_ERROR: 'm-0 mt-4 text-center font-body text-base text-error',
  ACTIONS: 'mt-8 flex flex-col items-center gap-5',
  FOOTER: 'mt-6 text-center font-body text-base text-body',
  FOOTER_ACTION: 'font-semibold text-link-strong underline',
  TEXT_LINK: 'cursor-pointer font-body text-lg text-link underline',
})

export const SPLIT_PAGE_IMAGE_SIZES = '50vw'

export const BRAND_KEY_WIDTH = 64

export const BRAND_WORDS = Object.freeze({ CLAVIS: 'CLAVIS', VIA: 'VIA' })

export const TAGLINE_KEYS: readonly TranslationKeys[] = Object.freeze([
  'welcome.taglineFirst',
  'welcome.taglineSecond',
  'welcome.taglineThird',
])

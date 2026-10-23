// Media files of the wave background: 1x is the 266 px wide design, 3x the 798 px wide one.
export const WAVE_IMAGE = Object.freeze({
  SOURCE: '/images/welcome-background.png',
  SOURCE_SET: '/images/welcome-background.png 266w, /images/welcome-background@3x.png 798w',
  // The card is the viewport wide on a phone and at most 430 px wide on a wide screen.
  SIZES: '(min-width: 768px) 430px, 100vw',
})

export const WAVE_CARD_CLASSES = Object.freeze({
  // Wide screens center the card on a soft lilac page; phones use the whole viewport.
  PAGE: 'flex min-h-svh w-full justify-center bg-white md:items-center md:bg-[#f5f2fc] md:p-6',
  // Phone: full width, at least the viewport tall and never shorter than the design proportion. Wide: the phone
  // proportion (266 x 560), at most 430 px wide and always inside the viewport, so it never needs scrolling.
  CARD: 'relative w-full min-h-svh aspect-[266/560] overflow-hidden bg-wave-top md:min-h-0 md:w-[min(430px,calc((100svh-3rem)*266/560))] md:rounded-[32px] md:shadow-xl',
  IMAGE: 'absolute bottom-0 left-0 block h-auto w-full select-none',
  FADE: 'absolute left-0 w-full bg-gradient-to-b from-wave-top to-transparent',
  LAYER: 'pointer-events-none absolute inset-0',
})

// Height (design units) of the fade that hides the edge between the flat top color and the image.
export const WAVE_FADE_HEIGHT = 24

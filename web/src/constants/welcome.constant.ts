export const WELCOME_CLASSES = Object.freeze({
  BRAND: 'absolute inset-x-0',
  KEY: 'absolute top-0 [&>svg]:h-auto [&>svg]:w-full',
  LETTERS: 'pointer-events-none absolute inset-0',
  LETTER: 'absolute text-center font-brand font-light text-brand',
  TAGLINE: 'absolute m-0 text-center font-body text-body',
  BUTTON_SLOT: 'absolute inset-x-0 flex justify-center px-4',
  LINK_ROW: 'pointer-events-none absolute inset-x-0 flex justify-center',
  LINK: "pointer-events-auto relative inline-block cursor-pointer font-body text-link before:absolute before:-inset-3 before:content-['']",
  UNDERLINE: 'absolute inset-x-0 bg-link',
})

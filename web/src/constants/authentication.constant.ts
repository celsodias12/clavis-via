export const AUTHENTICATION_CLASSES = Object.freeze({
  // The native form wraps the screen without a box of its own, so the absolute layout is unchanged.
  FORM: 'contents',
  TITLE: 'absolute right-0 m-0 grid font-title font-normal text-title',
  SUBTITLE: 'absolute right-0 m-0 grid font-body text-body',
  FORM_ERROR: 'absolute m-0 text-center font-body text-error',
  BUTTON_SLOT: 'absolute inset-x-0 flex justify-center px-4',
  FOOTER: 'absolute inset-x-0 mx-auto w-fit py-3 text-center font-body text-body',
  FOOTER_ACTION: 'font-semibold text-link-strong underline',
})

// Clerk renders its bot protection challenge (Turnstile) inside the element with this id; without it the
// challenge falls back to a modal.
export const CLERK_CAPTCHA_ELEMENT_ID = 'clerk-captcha'

// How long the splash waits for Clerk before it offers a retry, and the status Clerk reports when its script
// could not be loaded.
export const CLERK_LOAD_TIMEOUT_MILLISECONDS = 15000
export const CLERK_STATUS_ERROR = 'error'

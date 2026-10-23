export const FIELD_CLASSES = Object.freeze({
  CONTAINER: 'flex flex-col',
  LABEL: 'font-body font-medium text-body',
  INPUT:
    'border-field-border bg-field-background font-body text-title shadow-none placeholder:text-placeholder focus-visible:ring-0 focus-visible:border-navy md:text-title',
  ERROR: 'font-body text-error',
  // Web type scale for wide screens.
  WIDE_LABEL: 'mb-2 text-base',
  WIDE_INPUT: 'h-12 rounded-xl px-4 text-[17px] md:text-[17px]',
  WIDE_ERROR: 'mt-1.5 text-sm',
})

// Letter spacing applied to the placeholder only (typed text is untouched).
export const PLACEHOLDER_SPACING_CLASS = 'placeholder:tracking-[var(--placeholder-spacing)]'
export const PLACEHOLDER_SPACING_VARIABLE = '--placeholder-spacing'

// The multi line field (Ação do dia): a roomy box that the person may stretch down.
export const TEXT_AREA_CLASSES = Object.freeze({
  INPUT: 'min-h-32 resize-y rounded-2xl p-4 text-base md:min-h-36 md:text-[17px]',
  READ_ONLY: 'resize-none',
})

export const KEYBOARD_KEYS = Object.freeze({
  ENTER: 'Enter',
})

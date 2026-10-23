export const CHECK_IN_STATES = Object.freeze({
  HEAVY: 'heavy',
  ANXIOUS: 'anxious',
  DISCOURAGED: 'discouraged',
  IRRITATED: 'irritated',
  SENSITIVE: 'sensitive',
  AT_PEACE: 'at-peace',
  HOPEFUL: 'hopeful',
  OTHER: 'other',
})

export const CHECK_IN_OTHER_TEXT_MAXIMUM_LENGTH = 280

export const CHECK_IN_ISSUES = Object.freeze({
  OTHER_TEXT_REQUIRED: 'other_text_required',
  OTHER_TEXT_NOT_ALLOWED: 'other_text_not_allowed',
  LOCAL_DATE_OUT_OF_RANGE: 'local_date_out_of_range',
})

export const LOCAL_DATE_WINDOW = Object.freeze({
  MILLISECONDS_PER_DAY: 86_400_000,
  ISO_DATE_LENGTH: 10,
  TOLERANCE_DAYS: 1,
})

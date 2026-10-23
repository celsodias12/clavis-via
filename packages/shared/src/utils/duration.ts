import type { TFunction } from 'i18next'

const SECONDS_PER_MINUTE = 60
const SECOND_DIGITS = 2

// Clock text of a length in seconds: 138 -> "2:18".
export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE)
  const seconds = totalSeconds % SECONDS_PER_MINUTE
  return `${minutes}:${String(seconds).padStart(SECOND_DIGITS, '0')}`
}

// Length of a practice as people say it: whole minutes ("3 minutos") or minutes and seconds ("2 min 30 s").
// The translate function comes from the caller, so the text follows the language of its i18n instance.
export function formatPracticeDuration(totalSeconds: number, translate: TFunction): string {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE)
  const seconds = totalSeconds % SECONDS_PER_MINUTE
  return seconds === 0
    ? translate('screen.practice.duration.minutes', { count: minutes })
    : translate('screen.practice.duration.mixed', { minutes, seconds })
}

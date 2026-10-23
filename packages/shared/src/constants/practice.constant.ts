import type { TranslationKeys } from '../i18n/types'

// Behaviour of the practice player.
export const PRACTICE_PLAYER = Object.freeze({
  // How often the clock is read while a practice plays; the time itself comes from clock marks, not from counting ticks.
  TICK_INTERVAL_MILLISECONDS: 250,
  MILLISECONDS_PER_SECOND: 1000,
})

// What the play button shows: play, pause (while playing) or replay (once finished).
export const PRACTICE_PLAY_STATES = Object.freeze({
  PLAY: 'play',
  PAUSE: 'pause',
  AGAIN: 'again',
})

// The label (and accessibility name) of the play button in each state.
export const PRACTICE_PLAY_LABEL_KEYS = Object.freeze({
  [PRACTICE_PLAY_STATES.PLAY]: 'screen.practice.play',
  [PRACTICE_PLAY_STATES.PAUSE]: 'screen.practice.pause',
  [PRACTICE_PLAY_STATES.AGAIN]: 'screen.practice.again',
} satisfies Record<string, TranslationKeys>)

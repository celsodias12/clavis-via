import type { CheckInOption, CheckInState } from '../@types/check-in.type'
import { colors } from '../design/palette.constant'
import type { TranslationKeys } from '../i18n/types'

export const CHECK_IN_STATES = Object.freeze({
  HEAVY: 'heavy',
  ANXIOUS: 'anxious',
  DISCOURAGED: 'discouraged',
  IRRITATED: 'irritated',
  SENSITIVE: 'sensitive',
  AT_PEACE: 'at-peace',
  HOPEFUL: 'hopeful',
  OTHER: 'other',
} satisfies Record<string, CheckInState>)

export const CHECK_IN_OTHER_TEXT_MAXIMUM_LENGTH = 280

// Message of the form issue raised when "Outro" is chosen without text (a translation key, see validation/check-in.schema.ts).
export const CHECK_IN_VALIDATION_MESSAGE_KEYS = Object.freeze({
  OTHER_TEXT_REQUIRED: 'screen.checkIn.errors.otherTextRequired',
  STATE_REQUIRED: 'screen.checkIn.errors.stateRequired',
} satisfies Record<string, TranslationKeys>)

// Every state the API accepts needs an entry: a state added to the API breaks the typecheck here.
export const CHECK_IN_OPTION_BY_STATE: Readonly<Record<CheckInState, CheckInOption>> =
  Object.freeze({
    [CHECK_IN_STATES.HEAVY]: {
      state: CHECK_IN_STATES.HEAVY,
      labelKey: 'screen.checkIn.states.heavy',
      tileColor: colors.emotions.heavy.tile,
      iconColors: colors.emotions.heavy,
    },
    [CHECK_IN_STATES.ANXIOUS]: {
      state: CHECK_IN_STATES.ANXIOUS,
      labelKey: 'screen.checkIn.states.anxious',
      tileColor: colors.emotions.anxious.tile,
      iconColors: colors.emotions.anxious,
    },
    [CHECK_IN_STATES.DISCOURAGED]: {
      state: CHECK_IN_STATES.DISCOURAGED,
      labelKey: 'screen.checkIn.states.discouraged',
      tileColor: colors.emotions.discouraged.tile,
      iconColors: colors.emotions.discouraged,
    },
    [CHECK_IN_STATES.IRRITATED]: {
      state: CHECK_IN_STATES.IRRITATED,
      labelKey: 'screen.checkIn.states.irritated',
      tileColor: colors.emotions.irritated.tile,
      iconColors: colors.emotions.irritated,
    },
    [CHECK_IN_STATES.SENSITIVE]: {
      state: CHECK_IN_STATES.SENSITIVE,
      labelKey: 'screen.checkIn.states.sensitive',
      tileColor: colors.emotions.sensitive.tile,
      iconColors: colors.emotions.sensitive,
    },
    [CHECK_IN_STATES.AT_PEACE]: {
      state: CHECK_IN_STATES.AT_PEACE,
      labelKey: 'screen.checkIn.states.atPeace',
      tileColor: colors.emotions.atPeace.tile,
      iconColors: colors.emotions.atPeace,
    },
    [CHECK_IN_STATES.HOPEFUL]: {
      state: CHECK_IN_STATES.HOPEFUL,
      labelKey: 'screen.checkIn.states.hopeful',
      tileColor: colors.emotions.hopeful.tile,
      iconColors: colors.emotions.hopeful,
    },
    [CHECK_IN_STATES.OTHER]: {
      state: CHECK_IN_STATES.OTHER,
      labelKey: 'screen.checkIn.states.other',
      tileColor: colors.emotions.other.tile,
      iconColors: colors.emotions.other,
    },
  })

// The options in the order of the design (3 + 3 + 2 tiles).
export const CHECK_IN_OPTIONS: readonly CheckInOption[] = Object.freeze(
  [
    CHECK_IN_STATES.HEAVY,
    CHECK_IN_STATES.ANXIOUS,
    CHECK_IN_STATES.DISCOURAGED,
    CHECK_IN_STATES.IRRITATED,
    CHECK_IN_STATES.SENSITIVE,
    CHECK_IN_STATES.AT_PEACE,
    CHECK_IN_STATES.HOPEFUL,
    CHECK_IN_STATES.OTHER,
  ].map((state) => CHECK_IN_OPTION_BY_STATE[state]),
)

// How many tiles each grid row holds.
const CHECK_IN_ROW_SIZES = [3, 3, 2]

export const CHECK_IN_GRID_ROWS: readonly (readonly CheckInOption[])[] = Object.freeze(
  CHECK_IN_ROW_SIZES.map((size, rowIndex) => {
    const start = CHECK_IN_ROW_SIZES.slice(0, rowIndex).reduce((sum, rowSize) => sum + rowSize, 0)
    return Object.freeze(CHECK_IN_OPTIONS.slice(start, start + size))
  }),
)

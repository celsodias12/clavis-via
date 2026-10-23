import type { HeaderIconName } from '../@types/design.type'
import type { TranslationKeys } from '../i18n/types'
import { HEADER_ICON_PATHS } from './icon-path.constant'

export const HEADER_ICON_METRICS = Object.freeze({
  VIEW_BOX_SIZE: 24,
  // Minimum touch target in dp, not scaled (accessibility guideline).
  MINIMUM_TOUCH_SIZE: 44,
})

// Icon box (design units) and stroke width (in the 24 unit view box) of each header icon.
export const HEADER_ICON_STYLES = Object.freeze({
  back: Object.freeze({ path: HEADER_ICON_PATHS.BACK, size: 24, strokeWidth: 1.7 }),
  close: Object.freeze({ path: HEADER_ICON_PATHS.CLOSE, size: 24, strokeWidth: 1.7 }),
  bell: Object.freeze({ path: HEADER_ICON_PATHS.BELL, size: 18.2, strokeWidth: 1.6 }),
  search: Object.freeze({ path: HEADER_ICON_PATHS.SEARCH, size: 16.9, strokeWidth: 1.7 }),
  chevronBack: Object.freeze({ path: HEADER_ICON_PATHS.CHEVRON_BACK, size: 18.9, strokeWidth: 2 }),
  more: Object.freeze({ path: HEADER_ICON_PATHS.MORE, size: 16.1, strokeWidth: 4.9 }),
  settings: Object.freeze({ path: HEADER_ICON_PATHS.SETTINGS, size: 17, strokeWidth: 1.7 }),
})

// Accessibility label of each header icon.
export const HEADER_ICON_LABEL_KEYS = Object.freeze({
  back: 'common.back',
  chevronBack: 'common.back',
  close: 'common.close',
  more: 'common.more',
  search: 'common.search',
  bell: 'common.notifications',
  settings: 'common.settings',
} satisfies Record<HeaderIconName, TranslationKeys>)

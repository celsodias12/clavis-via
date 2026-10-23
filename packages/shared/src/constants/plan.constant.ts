import type {
  PlanCategoryFilter,
  PlanDaySegment,
  PlanImageNames,
  PlanTab,
} from '../@types/plan.type'
import type { TranslationKeys } from '../i18n/types'

export const PLAN_CATEGORY_FILTER_KEYS = Object.freeze({
  ALL: 'all',
  EMOTIONS: 'emotions',
  RELATIONSHIPS: 'relationships',
  FAITH: 'faith',
})

// The chips of the Planos screen, in the order the design shows them.
export const PLAN_CATEGORY_FILTERS = Object.freeze([
  Object.freeze({ key: PLAN_CATEGORY_FILTER_KEYS.ALL, labelKey: 'screen.plans.filters.all' }),
  Object.freeze({
    key: PLAN_CATEGORY_FILTER_KEYS.EMOTIONS,
    labelKey: 'screen.plans.filters.emotions',
  }),
  Object.freeze({
    key: PLAN_CATEGORY_FILTER_KEYS.RELATIONSHIPS,
    labelKey: 'screen.plans.filters.relationships',
  }),
  Object.freeze({ key: PLAN_CATEGORY_FILTER_KEYS.FAITH, labelKey: 'screen.plans.filters.faith' }),
] satisfies readonly PlanCategoryFilter[])

export const PLAN_TAB_KEYS = Object.freeze({
  OVERVIEW: 'overview',
  CONTENT: 'content',
  REFLECTIONS: 'reflections',
})

// The segments of the Plano screen, in the order the design shows them.
export const PLAN_TABS = Object.freeze([
  Object.freeze({ key: PLAN_TAB_KEYS.OVERVIEW, labelKey: 'screen.plan.tabs.overview' }),
  Object.freeze({ key: PLAN_TAB_KEYS.CONTENT, labelKey: 'screen.plan.tabs.content' }),
  Object.freeze({ key: PLAN_TAB_KEYS.REFLECTIONS, labelKey: 'screen.plan.tabs.reflections' }),
] satisfies readonly PlanTab[])

export const PLAN_DAY_SEGMENT_KEYS = Object.freeze({
  CONTENT: 'content',
  REFLECTION: 'reflection',
  ACTION: 'action',
  PRAYER: 'prayer',
})

// The segments of the Dia screen, in the order the design shows them (the footer walks through them).
export const PLAN_DAY_SEGMENTS = Object.freeze([
  Object.freeze({
    key: PLAN_DAY_SEGMENT_KEYS.CONTENT,
    labelKey: 'screen.planDay.segments.content',
  }),
  Object.freeze({
    key: PLAN_DAY_SEGMENT_KEYS.REFLECTION,
    labelKey: 'screen.planDay.segments.reflection',
  }),
  Object.freeze({ key: PLAN_DAY_SEGMENT_KEYS.ACTION, labelKey: 'screen.planDay.segments.action' }),
  Object.freeze({ key: PLAN_DAY_SEGMENT_KEYS.PRAYER, labelKey: 'screen.planDay.segments.prayer' }),
] satisfies readonly PlanDaySegment[])

// The first day of every plan, the one "Começar plano" opens.
export const FIRST_DAY_NUMBER = 1

// The reflection of a day is optional and the API accepts at most this many characters.
export const DAY_ACTION_REFLECTION_MAXIMUM_LENGTH = 1000

// Message of the reflection issue (a translation key, see validation/plan.schema.ts).
export const DAY_ACTION_VALIDATION_MESSAGE_KEYS = Object.freeze({
  REFLECTION_TOO_LONG: 'screen.dayAction.errors.reflectionTooLong',
} satisfies Record<string, TranslationKeys>)

// Names (file name without the extension and the @3x suffix) of the thumbnail and the cover of each plan, by
// plan id. Each platform turns a name into its own asset: the app requires the file, the web serves it.
export const PLAN_IMAGE_NAMES: Readonly<Record<string, PlanImageNames>> = Object.freeze({
  'when-discouragement-weighs': Object.freeze({
    thumbnail: 'plan-thumbnail-when-discouragement-weighs',
    cover: 'plan-cover-when-discouragement-weighs',
  }),
  'after-a-rejection': Object.freeze({
    thumbnail: 'plan-thumbnail-after-a-rejection',
    cover: 'plan-cover-after-a-rejection',
  }),
  'learning-to-set-boundaries': Object.freeze({
    thumbnail: 'plan-thumbnail-learning-to-set-boundaries',
    cover: 'plan-cover-learning-to-set-boundaries',
  }),
  'when-your-faith-is-tired': Object.freeze({
    thumbnail: 'plan-thumbnail-when-your-faith-is-tired',
    cover: 'plan-cover-when-your-faith-is-tired',
  }),
  'finding-direction-again': Object.freeze({
    thumbnail: 'plan-thumbnail-finding-direction-again',
    cover: 'plan-cover-finding-direction-again',
  }),
})

// 1 x 1 pale periwinkle PNG (#e8ecfa) the screens stretch when a plan has no image of its own.
export const PLAN_FALLBACK_IMAGE_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mN48eYXAAWOAs9cW7FFAAAAAElFTkSuQmCC'

import type {
  JourneyAchievementCopy,
  JourneyAchievementKind,
  JourneySegmentKey,
} from '../@types/journey.type'
import type { TranslationKeys } from '../i18n/types'

export const JOURNEY_SEGMENT_KEYS = Object.freeze({
  OVERVIEW: 'overview',
  EMOTIONS: 'emotions',
  ACHIEVEMENTS: 'achievements',
} satisfies Record<string, JourneySegmentKey>)

// The segments of the screen, in the order of the design.
export const JOURNEY_SEGMENTS = Object.freeze([
  { key: JOURNEY_SEGMENT_KEYS.OVERVIEW, labelKey: 'screen.journey.segments.overview' },
  { key: JOURNEY_SEGMENT_KEYS.EMOTIONS, labelKey: 'screen.journey.segments.emotions' },
  { key: JOURNEY_SEGMENT_KEYS.ACHIEVEMENTS, labelKey: 'screen.journey.segments.achievements' },
] satisfies readonly { key: JourneySegmentKey; labelKey: TranslationKeys }[])

export const ACHIEVEMENT_KINDS = Object.freeze({
  WEEKLY_CHECK_INS: 'weekly-check-ins',
  PLAN_PROGRESS: 'plan-progress',
  COMPLETED_PLANS: 'completed-plans',
  COMPLETED_PRACTICES: 'completed-practices',
  COMPLETED_ACTIONS: 'completed-actions',
} satisfies Record<string, JourneyAchievementKind>)

export const ACHIEVEMENT_COPY: Readonly<Record<JourneyAchievementKind, JourneyAchievementCopy>> =
  Object.freeze({
    [ACHIEVEMENT_KINDS.WEEKLY_CHECK_INS]: {
      icon: 'handClipboard',
      textKey: 'screen.journey.achievements.weeklyCheckIns',
    },
    [ACHIEVEMENT_KINDS.PLAN_PROGRESS]: {
      icon: 'clipboardCheck',
      textKey: 'screen.journey.achievements.planProgress',
    },
    [ACHIEVEMENT_KINDS.COMPLETED_PLANS]: {
      icon: 'clipboardCheck',
      textKey: 'screen.journey.achievements.completedPlans',
    },
    [ACHIEVEMENT_KINDS.COMPLETED_PRACTICES]: {
      icon: 'target',
      textKey: 'screen.journey.achievements.completedPractices',
    },
    [ACHIEVEMENT_KINDS.COMPLETED_ACTIONS]: {
      icon: 'heart',
      textKey: 'screen.journey.achievements.completedActions',
    },
  })

import type { AppRouter } from '@clavis-via/api/router'
import type { inferRouterOutputs } from '@trpc/server'
import type { ListRowIconName } from './design.type'

export type JourneyOverview = inferRouterOutputs<AppRouter>['journey']['overview']
export type JourneyWeekDay = JourneyOverview['week'][number]
export type JourneyAchievement = JourneyOverview['achievements'][number]
export type JourneyAchievementKind = JourneyAchievement['kind']

export type JourneySegmentKey = 'overview' | 'emotions' | 'achievements'

// The translation keys of the sentences; each one has a singular and a plural form chosen by the count.
export type JourneyAchievementTextKey =
  | 'screen.journey.achievements.weeklyCheckIns'
  | 'screen.journey.achievements.planProgress'
  | 'screen.journey.achievements.completedPlans'
  | 'screen.journey.achievements.completedPractices'
  | 'screen.journey.achievements.completedActions'

// How the row of one kind of achievement looks: its icon and the (plural aware) sentence.
export type JourneyAchievementCopy = Readonly<{
  icon: ListRowIconName
  textKey: JourneyAchievementTextKey
}>

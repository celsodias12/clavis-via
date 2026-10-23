import type { JourneyAchievement } from '../@types/journey.type'
import { ACHIEVEMENT_KINDS } from '../constants/journey.constant'

// The interpolation values of the sentence of an achievement: the plan progress names the plan and its days,
// every other kind has a count that also picks the singular or the plural form.
export function achievementTextOptions(
  achievement: JourneyAchievement,
): { plan: string; completed: number; total: number } | { count: number } {
  if (achievement.kind === ACHIEVEMENT_KINDS.PLAN_PROGRESS) {
    return {
      plan: achievement.planTitle,
      completed: achievement.completedDays,
      total: achievement.totalDays,
    }
  }
  return { count: achievement.count }
}

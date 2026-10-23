import { describe, expect, it } from 'vite-plus/test'
import type { JourneyAchievement } from '../@types/journey.type'
import { achievementTextOptions } from './journey'

describe('achievementTextOptions', () => {
  it('names the plan and its days for the plan progress', () => {
    const achievement: JourneyAchievement = {
      kind: 'plan-progress',
      planTitle: 'Quando o desânimo pesar',
      completedDays: 1,
      totalDays: 3,
    }
    expect(achievementTextOptions(achievement)).toEqual({
      plan: 'Quando o desânimo pesar',
      completed: 1,
      total: 3,
    })
  })

  it('passes the count of every other kind', () => {
    expect(achievementTextOptions({ kind: 'completed-plans', count: 2 })).toEqual({ count: 2 })
    expect(achievementTextOptions({ kind: 'weekly-check-ins', count: 5 })).toEqual({ count: 5 })
  })
})

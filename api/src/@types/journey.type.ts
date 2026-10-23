export type WeekDay = {
  localDate: string
  hasCheckIn: boolean
}

export type Achievement =
  | { kind: 'weekly-check-ins'; count: number }
  | { kind: 'plan-progress'; planTitle: string; completedDays: number; totalDays: number }
  | { kind: 'completed-plans'; count: number }
  | { kind: 'completed-practices'; count: number }
  | { kind: 'completed-actions'; count: number }

export type JourneyOverview = {
  streakDays: number
  week: WeekDay[]
  achievements: Achievement[]
}

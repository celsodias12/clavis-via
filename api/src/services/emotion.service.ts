import { and, asc, eq, gte, lte, sql } from 'drizzle-orm'
import type { CheckInState } from '../@types/check-in.type'
import type { Database } from '../@types/database.type'
import type {
  EmotionInsight,
  EmotionPeriod,
  EmotionPoint,
  EmotionSummary,
} from '../@types/emotion.type'
import { CHECK_IN_STATES } from '../constants/check-in.constant'
import {
  BALANCED_STATES,
  DIFFICULT_STATES,
  EMOTION_INSIGHT_KINDS,
  EMOTION_PERIODS,
  EMOTION_SCORE_DECIMALS_FACTOR,
  EMOTION_SCORES,
  PERCENT_FACTOR,
} from '../constants/emotion.constant'
import { checkIns, practiceCompletions } from '../database/schema.database'
import {
  addDays,
  monthDates,
  monthStart,
  weekDates,
  yearEnd,
  yearMonths,
  yearStart,
} from '../utils/date'

type DateRange = { start: string; end: string }

function periodRange(period: EmotionPeriod, anchor: string): DateRange {
  if (period === EMOTION_PERIODS.WEEK) {
    const dates = weekDates(anchor)
    return { start: dates[0], end: dates.at(-1) as string }
  }
  if (period === EMOTION_PERIODS.MONTH) {
    const dates = monthDates(anchor)
    return { start: dates[0], end: dates.at(-1) as string }
  }
  return { start: yearStart(anchor), end: yearEnd(anchor) }
}

// Any date inside the period right before the one that contains the anchor.
function previousAnchor(period: EmotionPeriod, anchor: string): string {
  if (period === EMOTION_PERIODS.WEEK) {
    return addDays(anchor, -weekDates(anchor).length)
  }
  if (period === EMOTION_PERIODS.MONTH) {
    return addDays(monthStart(anchor), -1)
  }
  return addDays(yearStart(anchor), -1)
}

// The state of a day is its latest check-in: created_at, then rowid, the same tie-break as the
// check-in service. Rows are read in ascending order so the last write per date wins.
async function loadDailyStates(
  database: Database,
  userId: string,
  range: DateRange,
): Promise<Map<string, CheckInState>> {
  const rows = await database
    .select({ localDate: checkIns.localDate, state: checkIns.state })
    .from(checkIns)
    .where(
      and(
        eq(checkIns.userId, userId),
        gte(checkIns.localDate, range.start),
        lte(checkIns.localDate, range.end),
      ),
    )
    .orderBy(asc(checkIns.createdAt), asc(sql`${checkIns}.rowid`))
  return new Map(rows.map((row) => [row.localDate, row.state]))
}

async function loadPracticeDates(
  database: Database,
  userId: string,
  range: DateRange,
): Promise<Set<string>> {
  const rows = await database
    .selectDistinct({ localDate: practiceCompletions.localDate })
    .from(practiceCompletions)
    .where(
      and(
        eq(practiceCompletions.userId, userId),
        gte(practiceCompletions.localDate, range.start),
        lte(practiceCompletions.localDate, range.end),
      ),
    )
  return new Set(rows.map((row) => row.localDate))
}

function scoreOf(state: CheckInState): number | null {
  return EMOTION_SCORES[state] ?? null
}

function average(scores: number[]): number | null {
  if (scores.length === 0) {
    return null
  }
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
  return Math.round(mean * EMOTION_SCORE_DECIMALS_FACTOR) / EMOTION_SCORE_DECIMALS_FACTOR
}

function buildPoints(
  period: EmotionPeriod,
  localDate: string,
  states: Map<string, CheckInState>,
): EmotionPoint[] {
  if (period === EMOTION_PERIODS.YEAR) {
    return yearMonths(localDate).map((key) => {
      const scores = [...states]
        .filter(([date]) => date.startsWith(key))
        .flatMap(([, state]) => scoreOf(state) ?? [])
      return { key, score: average(scores), state: null }
    })
  }
  const dates = period === EMOTION_PERIODS.WEEK ? weekDates(localDate) : monthDates(localDate)
  return dates.map((key) => {
    const state = states.get(key) ?? null
    return { key, score: state === null ? null : scoreOf(state), state }
  })
}

function countDays(states: Map<string, CheckInState>, wanted: readonly CheckInState[]): number {
  return [...states.values()].filter((state) => wanted.includes(state)).length
}

function lessAnxietyInsight(
  states: Map<string, CheckInState>,
  previousStates: Map<string, CheckInState>,
): EmotionInsight[] {
  const anxiousStates = [CHECK_IN_STATES.ANXIOUS]
  const current = countDays(states, anxiousStates)
  const previous = countDays(previousStates, anxiousStates)
  if (previous < 1 || current >= previous) {
    return []
  }
  return [
    {
      kind: EMOTION_INSIGHT_KINDS.LESS_ANXIETY,
      percent: Math.round(((previous - current) / previous) * PERCENT_FACTOR),
    },
  ]
}

function routineHelpsInsight(
  states: Map<string, CheckInState>,
  practiceDates: Set<string>,
): EmotionInsight[] {
  const withPractice: number[] = []
  const withoutPractice: number[] = []
  for (const [date, state] of states) {
    const score = scoreOf(state)
    if (score !== null) {
      const group = practiceDates.has(date) ? withPractice : withoutPractice
      group.push(score)
    }
  }
  const withAverage = average(withPractice)
  const withoutAverage = average(withoutPractice)
  if (withAverage === null || withoutAverage === null || withAverage <= withoutAverage) {
    return []
  }
  return [{ kind: EMOTION_INSIGHT_KINDS.ROUTINE_HELPS }]
}

export async function getEmotionSummary(
  database: Database,
  userId: string,
  input: { period: EmotionPeriod; localDate: string },
): Promise<EmotionSummary> {
  const { period, localDate } = input
  const range = periodRange(period, localDate)
  const [states, previousStates, practiceDates] = await Promise.all([
    loadDailyStates(database, userId, range),
    loadDailyStates(database, userId, periodRange(period, previousAnchor(period, localDate))),
    loadPracticeDates(database, userId, range),
  ])
  const balancedDays = countDays(states, BALANCED_STATES)
  const insights: EmotionInsight[] = [
    ...(balancedDays >= 1 && balancedDays > countDays(states, DIFFICULT_STATES)
      ? [{ kind: EMOTION_INSIGHT_KINDS.BALANCED_DAYS } as const]
      : []),
    ...lessAnxietyInsight(states, previousStates),
    ...routineHelpsInsight(states, practiceDates),
  ]
  return {
    period,
    points: buildPoints(period, localDate, states),
    hasCheckIns: states.size > 0,
    insights,
  }
}

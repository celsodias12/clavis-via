import { describe, expect, it } from 'vite-plus/test'
import type { EmotionInsight, EmotionPoint } from '../@types/emotion.type'
import {
  emotionColumnLabel,
  emotionDayLabel,
  insightTextOptions,
  toEmotionChartPoints,
} from './emotion'

const translate = (key: string) => `t:${key}`

function point(key: string, score: number | null = null): EmotionPoint {
  return { key, score, state: null }
}

describe('emotionColumnLabel', () => {
  it('labels the columns of the week with the weekday of their position', () => {
    expect(emotionColumnLabel('week', point('2026-10-19'), 0, translate)).toBe(
      't:screen.emotions.weekdays.monday',
    )
    expect(emotionColumnLabel('week', point('2026-10-25'), 6, translate)).toBe(
      't:screen.emotions.weekdays.sunday',
    )
  })

  it('labels the columns of the year with the initial of their month', () => {
    expect(emotionColumnLabel('year', point('2026-03'), 2, translate)).toBe(
      't:screen.emotions.monthInitials.march',
    )
  })

  it('labels only the days 1, 8, 15, 22 and 29 in the month view', () => {
    const labels = [1, 2, 8, 15, 22, 29, 30].map((day) =>
      emotionColumnLabel(
        'month',
        point(`2026-10-${String(day).padStart(2, '0')}`),
        day - 1,
        translate,
      ),
    )
    expect(labels).toEqual(['1', null, '8', '15', '22', '29', null])
  })
})

describe('toEmotionChartPoints', () => {
  it('keeps one column per point, with a null score where there is none', () => {
    expect(toEmotionChartPoints([point('a', 2), point('b'), point('c', 5)])).toEqual([
      { position: 0, score: 2 },
      { position: 1, score: null },
      { position: 2, score: 5 },
    ])
  })
})

describe('insightTextOptions', () => {
  it('carries the percentage of the less anxiety insight only', () => {
    expect(insightTextOptions({ kind: 'less-anxiety', percent: 30 } as EmotionInsight)).toEqual({
      percent: 30,
    })
    expect(insightTextOptions({ kind: 'balanced-days' } as EmotionInsight)).toEqual({})
    expect(insightTextOptions({ kind: 'routine-helps' } as EmotionInsight)).toEqual({})
  })
})

describe('emotionDayLabel', () => {
  const translateWithOptions = (key: string, options?: Record<string, string | null>) =>
    `${key}|${options?.day ?? ''}|${options?.state ?? ''}`

  it('says that a day without check-in has none', () => {
    expect(emotionDayLabel(point('2026-10-19'), 'Seg', translateWithOptions)).toBe(
      'screen.emotions.dayWithoutCheckIn|Seg|',
    )
  })

  it('names the state of the check-in of the day', () => {
    expect(
      emotionDayLabel(
        { key: '2026-10-19', score: 1, state: 'anxious' },
        'Seg',
        translateWithOptions,
      ),
    ).toBe('screen.emotions.dayLabel|Seg|screen.checkIn.states.anxious||')
  })
})

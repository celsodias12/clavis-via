import { act } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { renderHookWithProviders } from '../../../tests/utils/render-hook'
import { PLAN_DAY_SEGMENT_KEYS } from '../../constants/plan.constant'
import { usePlanDaySegments } from './use-plan-day-segments'

describe('usePlanDaySegments', () => {
  it('lists the four translated segments, starting on the first', () => {
    const { result, i18n } = renderHookWithProviders(() => usePlanDaySegments())

    expect(result.current.segments.map((segment) => segment.key)).toEqual(
      Object.values(PLAN_DAY_SEGMENT_KEYS),
    )
    expect(result.current.segments[0].label).toBe(i18n.t('screen.planDay.segments.content'))
    expect(result.current.selectedKey).toBe(PLAN_DAY_SEGMENT_KEYS.CONTENT)
    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(false)
  })

  it('walks forward and back, and tells the first and the last segment', () => {
    const { result } = renderHookWithProviders(() => usePlanDaySegments())

    act(() => result.current.goToNext())
    expect(result.current.selectedKey).toBe(PLAN_DAY_SEGMENT_KEYS.REFLECTION)
    expect(result.current.isFirst).toBe(false)

    act(() => result.current.selectSegment(PLAN_DAY_SEGMENT_KEYS.PRAYER))
    expect(result.current.selectedKey).toBe(PLAN_DAY_SEGMENT_KEYS.PRAYER)
    expect(result.current.isLast).toBe(true)

    act(() => result.current.goToPrevious())
    expect(result.current.selectedKey).toBe(PLAN_DAY_SEGMENT_KEYS.ACTION)
    expect(result.current.isLast).toBe(false)
  })
})

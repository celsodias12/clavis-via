import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PlanDaySegmentKey } from '../../@types/plan.type'
import { PLAN_DAY_SEGMENTS } from '../../constants/plan.constant'

const LAST_SEGMENT_INDEX = PLAN_DAY_SEGMENTS.length - 1

// The four segments of the Dia screen (Conteúdo, Reflexão, Ação, Oração) and the Anterior / Próximo walk
// through them, without any platform piece.
export function usePlanDaySegments() {
  const { t } = useTranslation()

  const [segmentIndex, setSegmentIndex] = useState(0)

  const selectedKey: PlanDaySegmentKey = PLAN_DAY_SEGMENTS[segmentIndex].key
  const segments = PLAN_DAY_SEGMENTS.map((segment) => ({
    key: segment.key,
    label: t(segment.labelKey),
  }))

  const selectSegment = (key: string) =>
    setSegmentIndex(PLAN_DAY_SEGMENTS.findIndex((segment) => segment.key === key))

  return {
    segments,
    selectedKey,
    selectSegment,
    isFirst: segmentIndex === 0,
    isLast: segmentIndex === LAST_SEGMENT_INDEX,
    goToPrevious: () => setSegmentIndex(segmentIndex - 1),
    goToNext: () => setSegmentIndex(segmentIndex + 1),
  }
}

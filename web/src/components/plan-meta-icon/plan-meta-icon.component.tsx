import { colors, PLAN_META_ICONS, type PlanMetaIconName } from '@clavis-via/shared'
import {
  PLAN_ICON_METRICS,
  PLAN_META_ICON_NAMES,
  PLAN_META_STROKE,
} from '../../constants/plan.constant'

type PlanMetaIconProps = Readonly<{
  icon: PlanMetaIconName
}>

// Small outline icon of the meta row of the Plano screen: a calendar (days) or a clock (time per day).
export function PlanMetaIcon({ icon }: PlanMetaIconProps) {
  const strokeProps = { ...PLAN_META_STROKE, strokeWidth: PLAN_META_ICONS.STROKE_WIDTH }

  return (
    <svg
      width={PLAN_ICON_METRICS.META_SIZE}
      height={PLAN_ICON_METRICS.META_SIZE}
      viewBox={`0 0 ${PLAN_META_ICONS.VIEW_BOX_SIZE} ${PLAN_META_ICONS.VIEW_BOX_SIZE}`}
      aria-hidden="true"
      focusable="false"
    >
      {icon === PLAN_META_ICON_NAMES.CALENDAR ? (
        <>
          <rect
            x={PLAN_META_ICONS.CALENDAR_BODY.x}
            y={PLAN_META_ICONS.CALENDAR_BODY.y}
            width={PLAN_META_ICONS.CALENDAR_BODY.width}
            height={PLAN_META_ICONS.CALENDAR_BODY.height}
            rx={PLAN_META_ICONS.CALENDAR_BODY.radius}
            stroke={colors.planCalendarIcon}
            {...strokeProps}
          />
          <path
            d={PLAN_META_ICONS.CALENDAR_LINES}
            stroke={colors.planCalendarIcon}
            {...strokeProps}
          />
          <circle
            cx={PLAN_META_ICONS.CALENDAR_DOT.cx}
            cy={PLAN_META_ICONS.CALENDAR_DOT.cy}
            r={PLAN_META_ICONS.CALENDAR_DOT.r}
            fill={colors.planCalendarIcon}
          />
        </>
      ) : (
        <>
          <circle
            cx={PLAN_META_ICONS.CLOCK_CIRCLE.cx}
            cy={PLAN_META_ICONS.CLOCK_CIRCLE.cy}
            r={PLAN_META_ICONS.CLOCK_CIRCLE.r}
            stroke={colors.title}
            {...strokeProps}
          />
          <path d={PLAN_META_ICONS.CLOCK_HANDS} stroke={colors.title} {...strokeProps} />
        </>
      )}
    </svg>
  )
}

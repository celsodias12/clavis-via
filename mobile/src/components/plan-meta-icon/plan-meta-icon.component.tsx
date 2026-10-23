import { useWindowDimensions } from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'
import { useUnistyles } from 'react-native-unistyles'
import type { PlanMetaIconName } from '../../@types/component.type'
import { PLAN_LAYOUT, PLAN_META_ICONS } from '../../constants/plan-layout.constant'
import { scaleDesignValue } from '../../utils/design'

type PlanMetaIconProps = Readonly<{
  icon: PlanMetaIconName
}>

// Small outline icon of the meta row of the Plano screen: a calendar (days) or a clock (time per day).
export function PlanMetaIcon({ icon }: PlanMetaIconProps) {
  const { theme } = useUnistyles()
  const { width } = useWindowDimensions()

  const size = scaleDesignValue(PLAN_LAYOUT.META_ICON_SIZE, width)
  const strokeProps = {
    fill: 'none',
    strokeWidth: PLAN_META_ICONS.STROKE_WIDTH,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const

  return (
    <Svg
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      width={size}
      height={size}
      viewBox={`0 0 ${PLAN_META_ICONS.VIEW_BOX_SIZE} ${PLAN_META_ICONS.VIEW_BOX_SIZE}`}
    >
      {icon === 'calendar' ? (
        <>
          <Rect
            x={PLAN_META_ICONS.CALENDAR_BODY.x}
            y={PLAN_META_ICONS.CALENDAR_BODY.y}
            width={PLAN_META_ICONS.CALENDAR_BODY.width}
            height={PLAN_META_ICONS.CALENDAR_BODY.height}
            rx={PLAN_META_ICONS.CALENDAR_BODY.radius}
            stroke={theme.colors.planCalendarIcon}
            {...strokeProps}
          />
          <Path
            d={PLAN_META_ICONS.CALENDAR_LINES}
            stroke={theme.colors.planCalendarIcon}
            {...strokeProps}
          />
          <Circle
            cx={PLAN_META_ICONS.CALENDAR_DOT.cx}
            cy={PLAN_META_ICONS.CALENDAR_DOT.cy}
            r={PLAN_META_ICONS.CALENDAR_DOT.r}
            fill={theme.colors.planCalendarIcon}
          />
        </>
      ) : (
        <>
          <Circle
            cx={PLAN_META_ICONS.CLOCK_CIRCLE.cx}
            cy={PLAN_META_ICONS.CLOCK_CIRCLE.cy}
            r={PLAN_META_ICONS.CLOCK_CIRCLE.r}
            stroke={theme.colors.title}
            {...strokeProps}
          />
          <Path d={PLAN_META_ICONS.CLOCK_HANDS} stroke={theme.colors.title} {...strokeProps} />
        </>
      )}
    </Svg>
  )
}

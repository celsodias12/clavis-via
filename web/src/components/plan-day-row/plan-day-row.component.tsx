import { colors, PLAN_ICONS, TEST_IDS } from '@clavis-via/shared'
import { Link, type LinkProps } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { PLAN_DAY_ROW_CLASSES, PLAN_ICON_METRICS } from '../../constants/plan.constant'

type PlanDayRowProps = Readonly<{
  dayNumber: number
  title: string
  isCompleted: boolean
  // True for every row but the last of the list: a hairline separates it from the next one.
  hasSeparator?: boolean
  // Where the row goes: a real link.
  linkProps: LinkProps
}>

// One day of the plan: a circle with the day number (a check once the day is done), "Dia N", its title and an arrow.
export function PlanDayRow({
  dayNumber,
  title,
  isCompleted,
  hasSeparator = false,
  linkProps,
}: PlanDayRowProps) {
  const { t } = useTranslation()

  const rowTestID = `${TEST_IDS.PLAN_DAY_ROW_PREFIX}${dayNumber}`
  const dayLabel = t('screen.plan.dayLabel', { number: dayNumber })
  const completedLabel = t('screen.plan.dayCompleted')

  return (
    <Link
      {...linkProps}
      data-testid={rowTestID}
      aria-label={
        isCompleted ? `${dayLabel}. ${title}. ${completedLabel}` : `${dayLabel}. ${title}`
      }
      className={PLAN_DAY_ROW_CLASSES.ROW}
    >
      <span className={PLAN_DAY_ROW_CLASSES.CIRCLE}>
        {isCompleted ? (
          <svg
            data-testid={`${rowTestID}${TEST_IDS.PLAN_DAY_ROW_COMPLETED_SUFFIX}`}
            width={PLAN_ICON_METRICS.CHECK_SIZE}
            height={PLAN_ICON_METRICS.CHECK_SIZE}
            viewBox={`0 0 ${PLAN_ICONS.VIEW_BOX_SIZE} ${PLAN_ICONS.VIEW_BOX_SIZE}`}
            aria-hidden="true"
            focusable="false"
          >
            <path
              d={PLAN_ICONS.CHECK.PATH}
              fill="none"
              stroke={colors.planAccent}
              strokeWidth={PLAN_ICONS.CHECK.STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          dayNumber
        )}
      </span>
      <span className={PLAN_DAY_ROW_CLASSES.TEXT}>
        <span className={PLAN_DAY_ROW_CLASSES.LABEL}>{dayLabel}</span>
        <span className={PLAN_DAY_ROW_CLASSES.TITLE}>{title}</span>
      </span>
      <svg
        className={PLAN_DAY_ROW_CLASSES.CHEVRON}
        width={PLAN_ICON_METRICS.CHEVRON_SIZE}
        height={PLAN_ICON_METRICS.CHEVRON_SIZE}
        viewBox={`0 0 ${PLAN_ICONS.VIEW_BOX_SIZE} ${PLAN_ICONS.VIEW_BOX_SIZE}`}
        aria-hidden="true"
        focusable="false"
      >
        <path
          d={PLAN_ICONS.CHEVRON.PATH}
          fill="none"
          stroke={colors.title}
          strokeWidth={PLAN_ICONS.CHEVRON.STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {hasSeparator ? <span className={PLAN_DAY_ROW_CLASSES.SEPARATOR} /> : null}
    </Link>
  )
}

import { CURRENT_PLAN_CHEVRON, type CurrentPlan, colors, TEST_IDS } from '@clavis-via/shared'
import { Link, type LinkProps } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { CURRENT_PLAN_CARD_CLASSES, HOME_METRICS } from '../../constants/home.constant'
import { ProgressBar } from '../progress-bar/progress-bar.component'

type CurrentPlanCardProps = Readonly<{
  // The plan in progress, or null when there is none (the card then invites to pick one).
  plan: CurrentPlan | null
  // Where the card goes: a real link.
  linkProps: LinkProps
}>

const CHEVRON_WIDTH =
  (HOME_METRICS.CHEVRON_HEIGHT * CURRENT_PLAN_CHEVRON.WIDTH) / CURRENT_PLAN_CHEVRON.HEIGHT

// The "Continue sua jornada" card: the plan in progress with its next day and how far the person has gone.
export function CurrentPlanCard({ plan, linkProps }: CurrentPlanCardProps) {
  const { t } = useTranslation()

  return (
    <Link
      {...linkProps}
      data-testid={TEST_IDS.HOME_CURRENT_PLAN}
      className={CURRENT_PLAN_CARD_CLASSES.CARD}
    >
      <span className={CURRENT_PLAN_CARD_CLASSES.TEXT}>
        <span className={CURRENT_PLAN_CARD_CLASSES.TITLE}>{t('screen.home.journeyTitle')}</span>
        <span className={CURRENT_PLAN_CARD_CLASSES.NAME}>
          {plan ? plan.title : t('screen.home.journeyEmpty')}
        </span>
        {plan ? (
          <>
            <span className={CURRENT_PLAN_CARD_CLASSES.DAY}>
              {t('screen.home.journeyDay', { number: plan.nextDayNumber, total: plan.totalDays })}
            </span>
            <span className={CURRENT_PLAN_CARD_CLASSES.BAR}>
              <ProgressBar
                progress={plan.completedDays / plan.totalDays}
                accessibilityLabel={t('screen.home.journeyProgress')}
              />
            </span>
          </>
        ) : null}
      </span>
      <svg
        className={CURRENT_PLAN_CARD_CLASSES.CHEVRON}
        width={CHEVRON_WIDTH}
        height={HOME_METRICS.CHEVRON_HEIGHT}
        viewBox={`0 0 ${CURRENT_PLAN_CHEVRON.WIDTH} ${CURRENT_PLAN_CHEVRON.HEIGHT}`}
        aria-hidden="true"
        focusable="false"
      >
        <path
          d={CURRENT_PLAN_CHEVRON.PATH}
          fill="none"
          stroke={colors.homeChevron}
          strokeWidth={CURRENT_PLAN_CHEVRON.STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  )
}

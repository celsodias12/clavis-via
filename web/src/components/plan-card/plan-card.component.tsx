import { colors, PLAN_ICONS, type PlanSummary, TEST_IDS } from '@clavis-via/shared'
import { Link, type LinkProps } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { PLAN_CARD_CLASSES, PLAN_ICON_METRICS } from '../../constants/plan.constant'
import { planImageSources } from '../../utils/plan-images'

type PlanCardProps = Readonly<{
  plan: PlanSummary
  // Where the card goes: a real link, so it can open in a new tab and shows its URL.
  linkProps: LinkProps
}>

// One card of the plan list. On a phone it is a row (photo, title with the duration, arrow); from 768 px it is a
// card with the cover photo on top that lifts on hover. The whole card is the link.
export function PlanCard({ plan, linkProps }: PlanCardProps) {
  const { t } = useTranslation()

  const { thumbnail, cover } = planImageSources(plan.id)

  return (
    <Link
      {...linkProps}
      data-testid={`${TEST_IDS.PLANS_ITEM_PREFIX}${plan.id}`}
      className={PLAN_CARD_CLASSES.CARD}
    >
      <picture className={PLAN_CARD_CLASSES.PICTURE}>
        {cover.srcSet ? (
          <source
            media={PLAN_CARD_CLASSES.COVER_MEDIA}
            srcSet={cover.srcSet}
            sizes={PLAN_CARD_CLASSES.COVER_SIZES}
          />
        ) : null}
        <img
          src={thumbnail.src}
          srcSet={thumbnail.srcSet}
          sizes={PLAN_CARD_CLASSES.PHOTO_SIZES}
          alt=""
          className={PLAN_CARD_CLASSES.PHOTO}
        />
      </picture>
      <span className={PLAN_CARD_CLASSES.TEXT}>
        <span className={PLAN_CARD_CLASSES.TITLE}>{plan.title}</span>
        <span className={PLAN_CARD_CLASSES.DURATION}>
          {t('screen.plans.duration', { count: plan.totalDays })}
        </span>
      </span>
      <svg
        className={PLAN_CARD_CLASSES.CHEVRON}
        width={PLAN_ICON_METRICS.CHEVRON_SIZE}
        height={PLAN_ICON_METRICS.CHEVRON_SIZE}
        viewBox={`0 0 ${PLAN_ICONS.VIEW_BOX_SIZE} ${PLAN_ICONS.VIEW_BOX_SIZE}`}
        aria-hidden="true"
        focusable="false"
      >
        <path
          d={PLAN_ICONS.CHEVRON.PATH}
          fill="none"
          stroke={colors.body}
          strokeWidth={PLAN_ICONS.CHEVRON.STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  )
}

import {
  PLAN_TAB_KEYS,
  PLAN_TABS,
  type PlanDetail,
  type PlanTabKey,
  primaryActionForPlan,
  REFLECTION_DATE_OPTIONS,
  TEST_IDS,
  usePlan,
  useStartPlan,
} from '@clavis-via/shared'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '../../components/error-state/error-state.component'
import { HeaderIconButton } from '../../components/header-icon-button/header-icon-button.component'
import { LoadingSkeleton } from '../../components/loading-skeleton/loading-skeleton.component'
import { PlanDayRow } from '../../components/plan-day-row/plan-day-row.component'
import { PlanMetaIcon } from '../../components/plan-meta-icon/plan-meta-icon.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { SegmentedControl } from '../../components/segmented-control/segmented-control.component'
import { PLAN_DETAIL_CLASSES, PLAN_META_ICON_NAMES } from '../../constants/plan.constant'
import { ROUTES } from '../../constants/route.constant'
import { useComingSoon } from '../../hooks/feedback/use-coming-soon'
import { useToast } from '../../hooks/feedback/use-toast'
import { useGoBack } from '../../hooks/navigation/use-go-back'
import { planImageSources } from '../../utils/plan-images'

type PlanScreenProps = Readonly<{ planId: string }>

// Plano: cover photo, title, duration, description, the Visão geral / Conteúdo / Reflexões segments and the
// button that starts, continues or (when everything is done) only reports the plan as completed. From 1024 px
// the cover is on the left and the rest on the right; below that the cover is on top. The page is one tree for
// every width (the layout is CSS), so the chosen segment survives a resize.
export function PlanScreen({ planId }: PlanScreenProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const showComingSoon = useComingSoon()
  const showToast = useToast()
  const { data, isPending, isError, isFetching, refetch } = usePlan(planId)
  const { mutateAsync: startPlan, isPending: isStarting } = useStartPlan()

  const [selectedKey, setSelectedKey] = useState<PlanTabKey>(PLAN_TAB_KEYS.OVERVIEW)

  const segments = PLAN_TABS.map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))

  const openDay = (dayNumber: number) =>
    navigate({ to: ROUTES.PLAN_DAY, params: { planId, dayNumber: String(dayNumber) } })

  // A direct visit has no previous page of the app to return to, so it goes to the list instead.
  const goBack = useGoBack(() => navigate({ to: ROUTES.PLANS }))

  const renderOverview = (plan: PlanDetail) => {
    const completedDayNumbers = new Set(plan.completedDayNumbers)

    return (
      <div className={PLAN_DETAIL_CLASSES.DAY_LIST}>
        {plan.days.map((day, index) => (
          <PlanDayRow
            key={day.dayNumber}
            dayNumber={day.dayNumber}
            title={day.title}
            isCompleted={completedDayNumbers.has(day.dayNumber)}
            hasSeparator={index < plan.days.length - 1}
            linkProps={{
              to: ROUTES.PLAN_DAY,
              params: { planId, dayNumber: String(day.dayNumber) },
            }}
          />
        ))}
      </div>
    )
  }

  const renderContent = (plan: PlanDetail) =>
    plan.days.map((day) => (
      <div
        key={day.dayNumber}
        data-testid={`${TEST_IDS.PLAN_CONTENT_ITEM_PREFIX}${day.dayNumber}`}
        className={PLAN_DETAIL_CLASSES.ITEM}
      >
        <h2 className={PLAN_DETAIL_CLASSES.ITEM_TITLE}>{day.title}</h2>
        <p className={PLAN_DETAIL_CLASSES.ITEM_BODY}>{day.summary}</p>
      </div>
    ))

  const renderReflections = (plan: PlanDetail) => {
    if (plan.reflections.length === 0) {
      return (
        <p
          data-testid={TEST_IDS.PLAN_REFLECTIONS_EMPTY}
          className={PLAN_DETAIL_CLASSES.REFLECTIONS_EMPTY}
        >
          {t('screen.plan.reflectionsEmpty')}
        </p>
      )
    }
    return plan.reflections.map((reflection) => (
      <div
        key={reflection.dayNumber}
        data-testid={`${TEST_IDS.PLAN_REFLECTION_PREFIX}${reflection.dayNumber}`}
        className={PLAN_DETAIL_CLASSES.ITEM}
      >
        <h2 className={PLAN_DETAIL_CLASSES.ITEM_TITLE}>{reflection.dayTitle}</h2>
        <p className={PLAN_DETAIL_CLASSES.ITEM_DATE}>
          {new Date(reflection.completedAt).toLocaleDateString(
            i18n.language,
            REFLECTION_DATE_OPTIONS,
          )}
        </p>
        <p className={PLAN_DETAIL_CLASSES.ITEM_BODY}>{reflection.text}</p>
      </div>
    ))
  }

  const renderTab = (plan: PlanDetail) => {
    if (selectedKey === PLAN_TAB_KEYS.CONTENT) {
      return renderContent(plan)
    }
    if (selectedKey === PLAN_TAB_KEYS.REFLECTIONS) {
      return renderReflections(plan)
    }
    return renderOverview(plan)
  }

  const renderFooter = (plan: PlanDetail) => {
    const action = primaryActionForPlan(plan)

    // Starting enrolls first and then opens the first day; continuing opens the first day left to do.
    const handlePress = async () => {
      if (action.needsEnrollment) {
        try {
          await startPlan({ planId })
        } catch {
          showToast(t('screen.plan.startError'))
          return
        }
      }
      await openDay(action.targetDayNumber)
    }

    return (
      <div className={PLAN_DETAIL_CLASSES.FOOTER}>
        <PrimaryButton
          testID={TEST_IDS.PLAN_PRIMARY_BUTTON}
          label={t(action.labelKey)}
          tone="accent"
          size="medium"
          isFullWidth
          isLoading={isStarting}
          isDisabled={action.isDisabled}
          onPress={handlePress}
        />
      </div>
    )
  }

  const renderSheet = () => {
    if (isPending) {
      return (
        <div className={PLAN_DETAIL_CLASSES.SKELETONS}>
          <LoadingSkeleton className={PLAN_DETAIL_CLASSES.SKELETON_TITLE} />
          {PLAN_DETAIL_CLASSES.SKELETON_KEYS.map((skeletonKey) => (
            <LoadingSkeleton key={skeletonKey} className={PLAN_DETAIL_CLASSES.SKELETON_ROW} />
          ))}
        </div>
      )
    }
    if (isError) {
      return (
        <ErrorState
          message={t('common.loadError')}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      )
    }
    return (
      <>
        <h1 data-testid={TEST_IDS.PLAN_TITLE} className={PLAN_DETAIL_CLASSES.TITLE}>
          {data.title}
        </h1>
        <div className={PLAN_DETAIL_CLASSES.META}>
          <span className={PLAN_DETAIL_CLASSES.META_ITEM}>
            <PlanMetaIcon icon={PLAN_META_ICON_NAMES.CALENDAR} />
            {t('screen.plans.duration', { count: data.totalDays })}
          </span>
          <span className={PLAN_DETAIL_CLASSES.META_ITEM}>
            <PlanMetaIcon icon={PLAN_META_ICON_NAMES.CLOCK} />
            {t('screen.plan.dailyTime')}
          </span>
        </div>
        <p className={PLAN_DETAIL_CLASSES.DESCRIPTION}>{data.description}</p>
        <div className={PLAN_DETAIL_CLASSES.SEGMENTS}>
          <SegmentedControl
            segments={segments}
            selectedKey={selectedKey}
            onSelect={(key) => setSelectedKey(key as PlanTabKey)}
            testIDPrefix={TEST_IDS.PLAN_SEGMENT_PREFIX}
          />
        </div>
        <div className={PLAN_DETAIL_CLASSES.PANEL}>{renderTab(data)}</div>
        {renderFooter(data)}
      </>
    )
  }

  const cover = planImageSources(planId).cover

  return (
    <div data-testid={TEST_IDS.PLAN_SCREEN} className={PLAN_DETAIL_CLASSES.SCREEN}>
      <div className={PLAN_DETAIL_CLASSES.PAGE}>
        <header className={PLAN_DETAIL_CLASSES.HEADER}>
          <span className={PLAN_DETAIL_CLASSES.HEADER_BUTTON}>
            <HeaderIconButton
              icon="chevronBack"
              onPress={goBack}
              accessibilityLabel={t('common.back')}
            />
          </span>
          <span className={PLAN_DETAIL_CLASSES.HEADER_BUTTON}>
            <HeaderIconButton
              icon="more"
              onPress={showComingSoon}
              accessibilityLabel={t('screen.plan.more')}
            />
          </span>
        </header>
        <div className={PLAN_DETAIL_CLASSES.COLUMNS}>
          <img
            data-testid={TEST_IDS.PLAN_COVER}
            src={cover.src}
            srcSet={cover.srcSet}
            sizes={PLAN_DETAIL_CLASSES.COVER_SIZES}
            alt=""
            className={PLAN_DETAIL_CLASSES.COVER}
          />
          <div className={PLAN_DETAIL_CLASSES.SHEET}>{renderSheet()}</div>
        </div>
      </div>
    </div>
  )
}

import {
  colors,
  PLAN_DAY_ICONS,
  PLAN_DAY_SEGMENT_KEYS,
  type PlanDay,
  TEST_IDS,
  usePlanDayRequest,
  usePlanDaySegments,
} from '@clavis-via/shared'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '../../components/error-state/error-state.component'
import { LoadingSkeleton } from '../../components/loading-skeleton/loading-skeleton.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { ScreenHeader } from '../../components/screen-header/screen-header.component'
import { SegmentedControl } from '../../components/segmented-control/segmented-control.component'
import { VideoPlaceholder } from '../../components/video-placeholder/video-placeholder.component'
import { PLAN_DAY_CLASSES } from '../../constants/plan-day.constant'
import { ROUTES } from '../../constants/route.constant'
import { useComingSoon } from '../../hooks/feedback/use-coming-soon'
import { useGoBack } from '../../hooks/navigation/use-go-back'

type PlanDayScreenProps = Readonly<{ planId: string; dayNumber: string }>

// Dia: the day of a plan in four segments (Conteúdo, Reflexão, Ação, Oração) walked with Anterior / Próximo.
// From 768 px it is a reading page: the header, the title and the segments on top, the video beside the message of
// the day from 1024 px, and Anterior / Próximo right after the content instead of pinned to the window bottom.
export function PlanDayScreen({ planId, dayNumber: routeDayNumber }: PlanDayScreenProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const showComingSoon = useComingSoon()
  // A direct visit has no previous page of the app to return to, so it goes to the plan instead.
  const goBack = useGoBack(() => navigate({ to: ROUTES.PLAN, params: { planId }, replace: true }))
  const { isValid, data, isPending, isFetching, retry } = usePlanDayRequest(
    planId,
    routeDayNumber,
    goBack,
  )
  const { segments, selectedKey, selectSegment, isFirst, isLast, goToPrevious, goToNext } =
    usePlanDaySegments()

  const renderSegment = (day: PlanDay) => {
    if (selectedKey === PLAN_DAY_SEGMENT_KEYS.CONTENT) {
      return (
        <div className={PLAN_DAY_CLASSES.CONTENT}>
          <VideoPlaceholder durationSeconds={day.videoDurationSeconds} onPlay={showComingSoon} />
          <div>
            <h2 className={PLAN_DAY_CLASSES.MESSAGE_TITLE}>{t('screen.planDay.todayMessage')}</h2>
            <p className={PLAN_DAY_CLASSES.MESSAGE_BODY}>{day.message}</p>
          </div>
        </div>
      )
    }
    if (selectedKey === PLAN_DAY_SEGMENT_KEYS.REFLECTION) {
      return <p className={PLAN_DAY_CLASSES.TEXT}>{day.reflection}</p>
    }
    if (selectedKey === PLAN_DAY_SEGMENT_KEYS.ACTION) {
      return (
        <>
          <p className={PLAN_DAY_CLASSES.TEXT}>{day.action}</p>
          <div className={PLAN_DAY_CLASSES.ACTION_BUTTON}>
            <PrimaryButton
              testID={TEST_IDS.DAY_ACTION_BUTTON}
              label={t('screen.planDay.goToAction')}
              tone="accent"
              size="medium"
              isFullWidth
              linkProps={{
                to: ROUTES.PLAN_DAY_ACTION,
                params: { planId, dayNumber: routeDayNumber },
              }}
            />
          </div>
        </>
      )
    }
    return <p className={PLAN_DAY_CLASSES.TEXT}>{day.prayer}</p>
  }

  const renderBody = () => {
    if (!isValid || (!isPending && data === undefined)) {
      return (
        <div className={PLAN_DAY_CLASSES.SKELETONS}>
          <ErrorState message={t('common.loadError')} onRetry={retry} isRetrying={isFetching} />
        </div>
      )
    }
    if (data === undefined) {
      return (
        <div className={PLAN_DAY_CLASSES.SKELETONS}>
          <LoadingSkeleton className={PLAN_DAY_CLASSES.SKELETON_TITLE} />
          <LoadingSkeleton className={PLAN_DAY_CLASSES.SKELETON_SEGMENTS} />
          <LoadingSkeleton className={PLAN_DAY_CLASSES.SKELETON_VIDEO} />
          {PLAN_DAY_CLASSES.SKELETON_KEYS.map((skeletonKey) => (
            <LoadingSkeleton key={skeletonKey} className={PLAN_DAY_CLASSES.SKELETON_LINE} />
          ))}
        </div>
      )
    }
    return (
      <>
        <h1 data-testid={TEST_IDS.DAY_TITLE} className={PLAN_DAY_CLASSES.TITLE}>
          {data.title}
        </h1>
        <div className={PLAN_DAY_CLASSES.SEGMENTS}>
          <SegmentedControl
            segments={segments}
            selectedKey={selectedKey}
            onSelect={selectSegment}
            variant="outline"
            testIDPrefix={TEST_IDS.DAY_SEGMENT_PREFIX}
          />
        </div>
        <div className={PLAN_DAY_CLASSES.PANEL}>{renderSegment(data)}</div>
      </>
    )
  }

  return (
    <div data-testid={TEST_IDS.DAY_SCREEN} className={PLAN_DAY_CLASSES.SCREEN}>
      <div className={PLAN_DAY_CLASSES.PAGE}>
        <ScreenHeader
          title={
            data === undefined
              ? ''
              : t('screen.planDay.headerTitle', { number: data.dayNumber, total: data.totalDays })
          }
          leftIcon="back"
          onLeftPress={goBack}
          rightIcon="more"
          onRightPress={showComingSoon}
        />
        <div className={PLAN_DAY_CLASSES.BODY}>{renderBody()}</div>
        {data === undefined ? null : (
          <div className={PLAN_DAY_CLASSES.FOOTER}>
            <button
              type="button"
              data-testid={TEST_IDS.DAY_PREVIOUS_BUTTON}
              disabled={isFirst}
              onClick={goToPrevious}
              className={PLAN_DAY_CLASSES.PREVIOUS}
            >
              <svg
                width={PLAN_DAY_CLASSES.CHEVRON_SIZE}
                height={PLAN_DAY_CLASSES.CHEVRON_SIZE}
                viewBox={`0 0 ${PLAN_DAY_ICONS.PREVIOUS_CHEVRON.VIEW_BOX_SIZE} ${PLAN_DAY_ICONS.PREVIOUS_CHEVRON.VIEW_BOX_SIZE}`}
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d={PLAN_DAY_ICONS.PREVIOUS_CHEVRON.PATH}
                  fill="none"
                  stroke={colors.body}
                  strokeWidth={PLAN_DAY_ICONS.PREVIOUS_CHEVRON.STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t('screen.planDay.previous')}
            </button>
            <div className={PLAN_DAY_CLASSES.NEXT}>
              <PrimaryButton
                testID={TEST_IDS.DAY_NEXT_BUTTON}
                label={t('screen.planDay.next')}
                tone="accent"
                size="slim"
                isFullWidth
                isDisabled={isLast}
                onPress={goToNext}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

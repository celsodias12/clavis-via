import {
  EMOTION_INSIGHT_COPY,
  EMOTION_PERIOD_SEGMENTS,
  EMOTION_PERIODS,
  type EmotionPeriod,
  type EmotionPoint,
  emotionColumnLabel,
  emotionDayLabel,
  insightTextOptions,
  TEST_IDS,
  useEmotionSummary,
} from '@clavis-via/shared'
import { useNavigate } from '@tanstack/react-router'
import { lazy, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmotionIcon } from '../../components/emotion-icon/emotion-icon.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { HeaderIconButton } from '../../components/header-icon-button/header-icon-button.component'
import { InsightRow } from '../../components/insight-row/insight-row.component'
import { LoadingSkeleton } from '../../components/loading-skeleton/loading-skeleton.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { ScreenHeader } from '../../components/screen-header/screen-header.component'
import { SegmentedControl } from '../../components/segmented-control/segmented-control.component'
import { EMOTIONS_CLASSES } from '../../constants/emotions.constant'
import { ROUTES } from '../../constants/route.constant'
import { useIsWideScreen } from '../../hooks/layout/use-is-wide-screen'
import { useGoBack } from '../../hooks/navigation/use-go-back'

// The chart pulls in recharts, a heavy library, so it loads in its own chunk when the first chart is drawn.
const EmotionChart = lazy(() =>
  import('../../components/emotion-chart/emotion-chart.component').then((module) => ({
    default: module.EmotionChart,
  })),
)

type EmotionsSummaryProps = Readonly<{ period: EmotionPeriod }>

const FULL_SIZE = '100%'

// Minhas emoções: the check-ins of the week, month or year as a line chart, the emoji of each day of the week
// and the rule-based "Principais percepções". From 768 px the page has a back button above a left aligned
// title (like the other pages) and the insights sit in two columns; a phone keeps the app header.
export function EmotionsScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isWide = useIsWideScreen()

  const [period, setPeriod] = useState<EmotionPeriod>(EMOTION_PERIODS.WEEK)

  // A direct visit has no previous page of the app to return to, so it goes to Minha jornada instead.
  const goBack = useGoBack(() => navigate({ to: ROUTES.JOURNEY }))

  return (
    <div data-testid={TEST_IDS.EMOTIONS_SCREEN} className={EMOTIONS_CLASSES.SCREEN}>
      <div className={EMOTIONS_CLASSES.PAGE}>
        {isWide ? (
          <>
            <div className={EMOTIONS_CLASSES.BACK}>
              <HeaderIconButton
                icon="chevronBack"
                onPress={goBack}
                accessibilityLabel={t('common.back')}
              />
            </div>
            <h1 className={EMOTIONS_CLASSES.TITLE}>{t('screen.emotions.title')}</h1>
          </>
        ) : (
          <ScreenHeader
            isHeading
            title={t('screen.emotions.title')}
            leftIcon="back"
            onLeftPress={goBack}
          />
        )}
        <div className={EMOTIONS_CLASSES.SEGMENTS}>
          <SegmentedControl
            segments={EMOTION_PERIOD_SEGMENTS.map((segment) => ({
              key: segment.key,
              label: t(segment.labelKey),
            }))}
            selectedKey={period}
            onSelect={(key) => setPeriod(key as EmotionPeriod)}
            variant="solid"
            testIDPrefix={TEST_IDS.EMOTIONS_SEGMENT_PREFIX}
          />
        </div>
        <EmotionsSummary period={period} />
      </div>
    </div>
  )
}

// Everything under the segments: the chart card and the insights, or the placeholder, error or empty state.
function EmotionsSummary({ period }: EmotionsSummaryProps) {
  const { t } = useTranslation()
  const { data, isPending, isError, isFetching, refetch } = useEmotionSummary(period)

  const isWeek = period === EMOTION_PERIODS.WEEK

  const renderColumn = (point: EmotionPoint, index: number) => {
    const label = emotionColumnLabel(period, point, index, (key) => t(key))
    // Only the days of the week are described: each one reads as a single item ("Seg: Ansiosa").
    const dayProps = isWeek
      ? {
          'data-testid': `${TEST_IDS.EMOTIONS_DAY_PREFIX}${point.key}`,
          role: 'img',
          'aria-label': emotionDayLabel(point, label, t),
        }
      : {}

    return (
      <div key={point.key} {...dayProps} className={EMOTIONS_CLASSES.COLUMN}>
        {isWeek ? (
          <span className={EMOTIONS_CLASSES.ICON_SLOT}>
            {point.state === null ? null : <EmotionIcon state={point.state} size={FULL_SIZE} />}
          </span>
        ) : null}
        {label === null ? null : <span className={EMOTIONS_CLASSES.DAY_LABEL}>{label}</span>}
      </div>
    )
  }

  if (isPending) {
    return (
      <div data-testid={TEST_IDS.EMOTIONS_SKELETON} className={EMOTIONS_CLASSES.SKELETONS}>
        <LoadingSkeleton className={EMOTIONS_CLASSES.CARD_SKELETON} />
        {EMOTIONS_CLASSES.SKELETON_KEYS.map((rowKey) => (
          <LoadingSkeleton key={rowKey} className={EMOTIONS_CLASSES.ROW_SKELETON} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className={EMOTIONS_CLASSES.ERROR}>
        <ErrorState
          message={t('common.loadError')}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      </div>
    )
  }

  if (!data.hasCheckIns) {
    return (
      <div className={`${EMOTIONS_CLASSES.CARD} ${EMOTIONS_CLASSES.EMPTY}`}>
        <p data-testid={TEST_IDS.EMOTIONS_EMPTY} className={EMOTIONS_CLASSES.EMPTY_TEXT}>
          {t('screen.emotions.empty')}
        </p>
        <div className={EMOTIONS_CLASSES.EMPTY_BUTTON}>
          <PrimaryButton
            label={t('screen.emotions.emptyAction')}
            tone="light"
            size="compact"
            isFullWidth
            linkProps={{ to: ROUTES.CHECK_IN }}
            testID={TEST_IDS.EMOTIONS_CHECK_IN}
          />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={EMOTIONS_CLASSES.CARD}>
        <div className={EMOTIONS_CLASSES.CHART}>
          <Suspense fallback={<LoadingSkeleton className={EMOTIONS_CLASSES.CHART_SKELETON} />}>
            <EmotionChart points={data.points} period={period} />
          </Suspense>
        </div>
        <div className={EMOTIONS_CLASSES.COLUMNS}>
          {data.points.map((point, index) => renderColumn(point, index))}
        </div>
      </div>
      <h2 className={EMOTIONS_CLASSES.HEADING}>{t('screen.emotions.insightsTitle')}</h2>
      {data.insights.length === 0 ? (
        <p data-testid={TEST_IDS.EMOTIONS_NO_INSIGHTS} className={EMOTIONS_CLASSES.NO_INSIGHTS}>
          {t('screen.emotions.noInsights')}
        </p>
      ) : (
        <div className={EMOTIONS_CLASSES.INSIGHTS}>
          {data.insights.map((insight, index) => {
            const copy = EMOTION_INSIGHT_COPY[insight.kind]

            return (
              <InsightRow
                key={insight.kind}
                kind={insight.kind}
                title={t(copy.titleKey)}
                text={t(copy.textKeys[period], insightTextOptions(insight))}
                hasDivider={index < data.insights.length - 1}
              />
            )
          })}
        </div>
      )}
    </>
  )
}

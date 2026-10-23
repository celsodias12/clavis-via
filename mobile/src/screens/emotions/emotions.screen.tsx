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
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, useWindowDimensions, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { AppText } from '../../components/app-text/app-text.component'
import { EmotionChart } from '../../components/emotion-chart/emotion-chart.component'
import { EmotionIcon } from '../../components/emotion-icon/emotion-icon.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { InsightRow } from '../../components/insight-row/insight-row.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { ScreenHeader } from '../../components/screen-header/screen-header.component'
import { SegmentedControl } from '../../components/segmented-control/segmented-control.component'
import { Skeleton } from '../../components/skeleton/skeleton.component'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { DESIGN } from '../../constants/design.constant'
import {
  EMOTIONS_HEADER_LAYOUT,
  EMOTIONS_LAYOUT,
  EMOTIONS_SKELETON_LAYOUT,
} from '../../constants/emotions-layout.constant'
import { SEGMENTED_CONTROL_SOLID_LAYOUT } from '../../constants/plan-layout.constant'
import { ROUTES } from '../../constants/route.constant'
import { scaleDesignValue } from '../../utils/design'

type EmotionsSummaryProps = Readonly<{ period: EmotionPeriod }>

// Minhas emoções: the check-ins of the week, month or year as a line chart, the emoji of each day of the week
// and the rule-based "Principais percepções".
export function EmotionsScreen() {
  const { t } = useTranslation()
  const router = useRouter()

  const [period, setPeriod] = useState<EmotionPeriod>(EMOTION_PERIODS.WEEK)

  return (
    <View testID={TEST_IDS.EMOTIONS_SCREEN} style={styles.screen}>
      <ScreenHeader
        title={t('screen.emotions.title')}
        layout={EMOTIONS_HEADER_LAYOUT}
        leftIcon="back"
        onLeftPress={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.segments}>
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
        </View>
        <EmotionsSummary period={period} />
      </ScrollView>
    </View>
  )
}

// Everything under the segments: the chart card and the insights, or the placeholder, error or empty state.
function EmotionsSummary({ period }: EmotionsSummaryProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const { data, isPending, isError, isFetching, refetch } = useEmotionSummary(period)

  const iconSize = scaleDesignValue(EMOTIONS_LAYOUT.DAY_ICON_SIZE, width)

  const columnLabel = (point: EmotionPoint, index: number): string | null =>
    emotionColumnLabel(period, point, index, (key) => t(key))

  const renderColumn = (point: EmotionPoint, index: number) => {
    const label = columnLabel(point, index)
    const isWeek = period === EMOTION_PERIODS.WEEK
    const accessibilityLabel = isWeek ? emotionDayLabel(point, label, t) : undefined
    return (
      <View
        key={point.key}
        testID={isWeek ? `${TEST_IDS.EMOTIONS_DAY_PREFIX}${point.key}` : undefined}
        accessible={isWeek}
        accessibilityLabel={accessibilityLabel}
        style={styles.column}
      >
        {isWeek && point.state !== null ? (
          <View style={styles.dayIcon}>
            <EmotionIcon state={point.state} size={iconSize} />
          </View>
        ) : null}
        {label === null ? null : (
          <AppText variant="body" style={styles.dayLabel}>
            {label}
          </AppText>
        )}
      </View>
    )
  }

  if (isPending) {
    return (
      <View testID={TEST_IDS.EMOTIONS_SKELETON} style={styles.skeleton}>
        <Skeleton height={EMOTIONS_LAYOUT.CARD_HEIGHT} radius={EMOTIONS_LAYOUT.CARD_RADIUS} />
        <View style={styles.skeletonRows}>
          {EMOTIONS_SKELETON_LAYOUT.ROW_KEYS.map((rowKey) => (
            <Skeleton
              key={rowKey}
              height={EMOTIONS_SKELETON_LAYOUT.ROW_HEIGHT}
              radius={EMOTIONS_SKELETON_LAYOUT.ROW_RADIUS}
            />
          ))}
        </View>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.error}>
        <ErrorState
          message={t('common.loadError')}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      </View>
    )
  }

  if (!data.hasCheckIns) {
    return (
      <View style={styles.card}>
        <View style={styles.empty}>
          <AppText variant="body" testID={TEST_IDS.EMOTIONS_EMPTY} style={styles.emptyText}>
            {t('screen.emotions.empty')}
          </AppText>
          <View style={styles.emptyButton}>
            <PrimaryButton
              label={t('screen.emotions.emptyAction')}
              tone="light"
              size="compact"
              isFullWidth
              onPress={() => router.push(ROUTES.CHECK_IN)}
              testID={TEST_IDS.EMOTIONS_CHECK_IN}
            />
          </View>
        </View>
      </View>
    )
  }

  return (
    <>
      <View style={styles.card}>
        <View style={styles.chart}>
          <EmotionChart points={data.points} period={period} />
        </View>
        <View style={styles.columns}>
          {data.points.map((point, index) => renderColumn(point, index))}
        </View>
      </View>
      <AppText variant="bodySemiBold" accessibilityRole="header" style={styles.heading}>
        {t('screen.emotions.insightsTitle')}
      </AppText>
      {data.insights.length === 0 ? (
        <AppText variant="body" testID={TEST_IDS.EMOTIONS_NO_INSIGHTS} style={styles.noInsights}>
          {t('screen.emotions.noInsights')}
        </AppText>
      ) : (
        <View style={styles.insights}>
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
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const layout = EMOTIONS_LAYOUT
  const segmentsBottom = layout.SEGMENTS_TOP + SEGMENTED_CONTROL_SOLID_LAYOUT.HEIGHT
  const cardBottom = layout.CARD_TOP + layout.CARD_HEIGHT
  const headingTop =
    layout.HEADING_BASELINE - AUTHENTICATION_FONT_METRICS.BODY_ASCENT * layout.HEADING_FONT_SIZE
  const headingBottom =
    headingTop +
    (AUTHENTICATION_FONT_METRICS.BODY_ASCENT + AUTHENTICATION_FONT_METRICS.BODY_DESCENT) *
      layout.HEADING_FONT_SIZE
  const labelTop =
    layout.DAY_LABEL_BASELINE - AUTHENTICATION_FONT_METRICS.BODY_ASCENT * layout.DAY_LABEL_FONT_SIZE

  return {
    screen: { flex: 1, backgroundColor: theme.colors.planSheetBackground },
    content: { paddingBottom: layout.CONTENT_BOTTOM_GAP * scale + runtime.insets.bottom },
    // The header is fixed above the scroll area, so the content measures from the row where it ends.
    segments: {
      alignSelf: 'flex-start',
      marginTop: (layout.SEGMENTS_TOP - EMOTIONS_HEADER_LAYOUT.END_Y) * scale,
      marginLeft: layout.SEGMENTS_LEFT * scale,
    },
    card: {
      height: layout.CARD_HEIGHT * scale,
      marginTop: (layout.CARD_TOP - segmentsBottom) * scale,
      marginLeft: layout.CARD_LEFT * scale,
      marginRight: layout.CARD_RIGHT * scale,
      borderRadius: layout.CARD_RADIUS * scale,
      backgroundColor: theme.colors.homeCardBackground,
      boxShadow: `0 ${2 * scale}px ${8 * scale}px ${theme.colors.planCardShadow}`,
    },
    chart: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: layout.CHART_TOP * scale,
    },
    // One column per point, filling the card; the labels and the emoji are placed from the top of the card.
    columns: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: layout.CARD_HEIGHT * scale,
      flexDirection: 'row',
    },
    column: { flex: 1, alignItems: 'center' },
    dayIcon: { position: 'absolute', top: layout.DAY_ICON_TOP * scale },
    dayLabel: {
      position: 'absolute',
      top: labelTop * scale,
      width: layout.DAY_LABEL_WIDTH * scale,
      textAlign: 'center',
      fontSize: layout.DAY_LABEL_FONT_SIZE * scale,
      color: theme.colors.body,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      rowGap: 12 * scale,
    },
    emptyText: {
      textAlign: 'center',
      fontSize: 11 * scale,
      color: theme.colors.body,
    },
    emptyButton: { alignSelf: 'stretch', paddingHorizontal: 24 * scale },
    heading: {
      marginTop: (headingTop - cardBottom) * scale,
      marginLeft: layout.HEADING_LEFT * scale,
      fontSize: layout.HEADING_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    insights: { marginTop: (layout.INSIGHTS_TOP - headingBottom) * scale },
    noInsights: {
      marginTop: (layout.INSIGHTS_TOP - headingBottom) * scale,
      marginHorizontal: layout.HEADING_LEFT * scale,
      fontSize: 10 * scale,
      color: theme.colors.body,
    },
    skeleton: {
      marginTop: (layout.CARD_TOP - segmentsBottom) * scale,
      marginLeft: layout.CARD_LEFT * scale,
      marginRight: layout.CARD_RIGHT * scale,
    },
    skeletonRows: {
      marginTop: (layout.INSIGHTS_TOP - cardBottom) * scale,
      rowGap: EMOTIONS_SKELETON_LAYOUT.ROW_GAP * scale,
    },
    error: { marginTop: (layout.CARD_TOP - segmentsBottom) * scale },
  }
})

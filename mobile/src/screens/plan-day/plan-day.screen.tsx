import {
  PLAN_DAY_SEGMENT_KEYS,
  type PlanDay,
  TEST_IDS,
  usePlanDayRequest,
  usePlanDaySegments,
} from '@clavis-via/shared'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { AppText } from '../../components/app-text/app-text.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { ScreenHeader } from '../../components/screen-header/screen-header.component'
import { SegmentedControl } from '../../components/segmented-control/segmented-control.component'
import { Skeleton } from '../../components/skeleton/skeleton.component'
import { VideoPlaceholder } from '../../components/video-placeholder/video-placeholder.component'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { BUTTON_METRICS } from '../../constants/component.constant'
import { DESIGN } from '../../constants/design.constant'
import { PLAN_DAY_LAYOUT, SCREEN_HEADER_LAYOUT } from '../../constants/plan-day-layout.constant'
import { SEGMENTED_CONTROL_OUTLINE_LAYOUT } from '../../constants/plan-layout.constant'
import { ROUTES } from '../../constants/route.constant'
import { useComingSoon } from '../../hooks/feedback/use-coming-soon'

// Dia: the day of a plan in four segments (Conteúdo, Reflexão, Ação, Oração) walked with Anterior / Próximo.
export function PlanDayScreen() {
  const { t } = useTranslation()
  const { theme } = useUnistyles()
  const router = useRouter()
  const { planId, dayNumber: routeDayNumber } = useLocalSearchParams<{
    planId: string
    dayNumber: string
  }>()
  const showComingSoon = useComingSoon()
  const { isValid, data, isPending, isFetching, retry } = usePlanDayRequest(
    planId,
    routeDayNumber,
    () => router.back(),
  )
  const { segments, selectedKey, selectSegment, isFirst, isLast, goToPrevious, goToNext } =
    usePlanDaySegments()

  const renderSegment = (day: PlanDay) => {
    if (selectedKey === PLAN_DAY_SEGMENT_KEYS.CONTENT) {
      return (
        <>
          <VideoPlaceholder durationSeconds={day.videoDurationSeconds} onPlay={showComingSoon} />
          <AppText variant="titleMedium" style={styles.messageTitle}>
            {t('screen.planDay.todayMessage')}
          </AppText>
          <AppText variant="body" style={styles.messageBody}>
            {day.message}
          </AppText>
        </>
      )
    }
    if (selectedKey === PLAN_DAY_SEGMENT_KEYS.REFLECTION) {
      return (
        <AppText variant="body" style={styles.body}>
          {day.reflection}
        </AppText>
      )
    }
    if (selectedKey === PLAN_DAY_SEGMENT_KEYS.ACTION) {
      return (
        <>
          <AppText variant="body" style={styles.body}>
            {day.action}
          </AppText>
          <View style={styles.actionButton}>
            <PrimaryButton
              testID={TEST_IDS.DAY_ACTION_BUTTON}
              label={t('screen.planDay.goToAction')}
              tone="accent"
              size="medium"
              isFullWidth
              onPress={() =>
                router.push({
                  pathname: ROUTES.PLAN_DAY_ACTION,
                  params: { planId, dayNumber: routeDayNumber },
                })
              }
            />
          </View>
        </>
      )
    }
    return (
      <AppText variant="body" style={styles.body}>
        {day.prayer}
      </AppText>
    )
  }

  const renderBody = () => {
    if (!isValid || (!isPending && data === undefined)) {
      return <ErrorState message={t('common.loadError')} onRetry={retry} isRetrying={isFetching} />
    }
    if (data === undefined) {
      return (
        <View style={styles.skeletons}>
          <Skeleton height={PLAN_DAY_LAYOUT.SKELETON_LINE_HEIGHT * 2} />
          <Skeleton height={SEGMENTED_CONTROL_OUTLINE_LAYOUT.HEIGHT} />
          <Skeleton height={PLAN_DAY_LAYOUT.VIDEO_HEIGHT} />
          {PLAN_DAY_LAYOUT.SKELETON_KEYS.map((skeletonKey) => (
            <Skeleton key={skeletonKey} height={PLAN_DAY_LAYOUT.SKELETON_LINE_HEIGHT} />
          ))}
        </View>
      )
    }
    return (
      <>
        <AppText
          variant="titleMedium"
          testID={TEST_IDS.DAY_TITLE}
          accessibilityRole="header"
          style={styles.title}
        >
          {data.title}
        </AppText>
        <View style={styles.segments}>
          <SegmentedControl
            segments={segments}
            selectedKey={selectedKey}
            onSelect={selectSegment}
            variant="outline"
            testIDPrefix={TEST_IDS.DAY_SEGMENT_PREFIX}
          />
        </View>
        <View style={styles.panel}>{renderSegment(data)}</View>
      </>
    )
  }

  return (
    <View testID={TEST_IDS.DAY_SCREEN} style={styles.screen}>
      <ScreenHeader
        title={
          data === undefined
            ? ''
            : t('screen.planDay.headerTitle', { number: data.dayNumber, total: data.totalDays })
        }
        leftIcon="back"
        onLeftPress={() => router.back()}
        rightIcon="more"
        onRightPress={showComingSoon}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderBody()}
      </ScrollView>
      {data === undefined ? null : (
        <View style={styles.footer}>
          <Pressable
            testID={TEST_IDS.DAY_PREVIOUS_BUTTON}
            accessibilityRole="button"
            accessibilityLabel={t('screen.planDay.previous')}
            accessibilityState={{ disabled: isFirst }}
            disabled={isFirst}
            onPress={goToPrevious}
            style={styles.previous(isFirst)}
          >
            <Svg
              width={styles.chevron.width}
              height={styles.chevron.height}
              viewBox={`0 0 ${PLAN_DAY_LAYOUT.PREVIOUS_CHEVRON_VIEW_BOX_SIZE} ${PLAN_DAY_LAYOUT.PREVIOUS_CHEVRON_VIEW_BOX_SIZE}`}
              style={styles.chevron}
            >
              <Path
                d={PLAN_DAY_LAYOUT.PREVIOUS_CHEVRON_PATH}
                fill="none"
                stroke={theme.colors.body}
                strokeWidth={PLAN_DAY_LAYOUT.PREVIOUS_CHEVRON_STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <AppText variant="bodyMedium" style={styles.previousLabel}>
              {t('screen.planDay.previous')}
            </AppText>
          </Pressable>
          <View style={styles.next}>
            <PrimaryButton
              testID={TEST_IDS.DAY_NEXT_BUTTON}
              label={t('screen.planDay.next')}
              tone="accent"
              size="slim"
              isFullWidth
              isDisabled={isLast}
              onPress={goToNext}
            />
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const layout = PLAN_DAY_LAYOUT
  const titleAscent = AUTHENTICATION_FONT_METRICS.TITLE_ASCENT
  const titleDescent = AUTHENTICATION_FONT_METRICS.TITLE_DESCENT
  const bodyDescent = AUTHENTICATION_FONT_METRICS.BODY_DESCENT

  // Vertical rhythm, from baselines: each block is placed relative to the one above it, so a longer text
  // pushes the rest down instead of overlapping it.
  const titleTop = layout.TITLE_BASELINE - titleAscent * layout.TITLE_FONT_SIZE
  const titleBottom = layout.TITLE_BASELINE + titleDescent * layout.TITLE_FONT_SIZE
  const segmentsBottom = layout.SEGMENTS_TOP + SEGMENTED_CONTROL_OUTLINE_LAYOUT.HEIGHT
  const videoBottom = layout.VIDEO_TOP + layout.VIDEO_HEIGHT
  const messageTitleTop =
    layout.MESSAGE_TITLE_BASELINE - titleAscent * layout.MESSAGE_TITLE_FONT_SIZE
  const messageTitleBottom =
    layout.MESSAGE_TITLE_BASELINE + titleDescent * layout.MESSAGE_TITLE_FONT_SIZE
  const bodyTop =
    layout.BODY_FIRST_BASELINE - (layout.BODY_LINE_HEIGHT - bodyDescent * layout.BODY_FONT_SIZE)
  const footerHeight =
    runtime.insets.bottom + (layout.CARD_BOTTOM - layout.FOOTER_BUTTON_TOP) * scale
  const bodyText = {
    width: layout.BODY_WIDTH * scale,
    fontSize: layout.BODY_FONT_SIZE * scale,
    lineHeight: layout.BODY_LINE_HEIGHT * scale,
    color: theme.colors.body,
  }

  return {
    screen: { flex: 1, backgroundColor: theme.colors.planSheetBackground },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: footerHeight + layout.CONTENT_BOTTOM_GAP * scale,
    },
    title: {
      marginTop: (titleTop - SCREEN_HEADER_LAYOUT.END_Y) * scale,
      marginLeft: layout.TITLE_LEFT * scale,
      fontSize: layout.TITLE_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    segments: {
      marginTop: (layout.SEGMENTS_TOP - titleBottom) * scale,
      marginLeft: layout.SEGMENTS_LEFT * scale,
    },
    panel: {
      marginTop: (layout.VIDEO_TOP - segmentsBottom) * scale,
      marginLeft: layout.CONTENT_LEFT * scale,
      marginRight: layout.CONTENT_RIGHT * scale,
    },
    messageTitle: {
      marginTop: (messageTitleTop - videoBottom) * scale,
      fontSize: layout.MESSAGE_TITLE_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    messageBody: {
      ...bodyText,
      marginTop: (bodyTop - messageTitleBottom) * scale,
    },
    body: bodyText,
    actionButton: { marginTop: layout.ACTION_BUTTON_GAP * scale },
    skeletons: {
      marginTop: (titleTop - SCREEN_HEADER_LAYOUT.END_Y) * scale,
      marginHorizontal: layout.CONTENT_LEFT * scale,
      rowGap: layout.SKELETON_LINE_GAP * scale * 2,
    },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: footerHeight,
      flexDirection: 'row',
      alignItems: 'flex-start',
      columnGap: layout.FOOTER_BUTTON_GAP * scale,
      paddingLeft: layout.CONTENT_LEFT * scale,
      paddingRight: layout.CONTENT_RIGHT * scale,
      backgroundColor: theme.colors.planSheetBackground,
    },
    previous: (isDisabled: boolean) => ({
      width: layout.PREVIOUS_BUTTON_WIDTH * scale,
      height: layout.FOOTER_BUTTON_HEIGHT * scale,
      borderRadius: layout.FOOTER_BUTTON_RADIUS * scale,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: layout.PREVIOUS_LABEL_PADDING_LEFT * scale,
      backgroundColor: theme.colors.dayPreviousButton,
      opacity: isDisabled ? BUTTON_METRICS.DISABLED_OPACITY : BUTTON_METRICS.ENABLED_OPACITY,
    }),
    chevron: {
      position: 'absolute',
      left: layout.PREVIOUS_CHEVRON_BOX_LEFT * scale,
      width: layout.PREVIOUS_CHEVRON_SIZE * scale,
      height: layout.PREVIOUS_CHEVRON_SIZE * scale,
    },
    previousLabel: {
      fontSize: layout.FOOTER_FONT_SIZE * scale,
      color: theme.colors.body,
    },
    next: { flex: 1 },
  }
})

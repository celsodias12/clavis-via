import {
  formatClock,
  formatPracticeDuration,
  PRACTICE_PLAY_LABEL_KEYS,
  TEST_IDS,
  usePracticeSession,
} from '@clavis-via/shared'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, View } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { AppText } from '../../components/app-text/app-text.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { ProgressBar } from '../../components/progress-bar/progress-bar.component'
import { ScreenHeader } from '../../components/screen-header/screen-header.component'
import { Skeleton } from '../../components/skeleton/skeleton.component'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { DESIGN } from '../../constants/design.constant'
import { PRACTICE_HEADER_LAYOUT, PRACTICE_LAYOUT } from '../../constants/practice-layout.constant'
import { PRACTICE_PLAY_GRADIENT_ID } from '../../constants/practice-media.constant'
import { usePauseWhenBackgrounded } from '../../hooks/practice/use-pause-when-backgrounded'
import { usePracticeAudio } from '../../hooks/practice/use-practice-audio'

// Prática de hoje: the title, length and description of a practice, a big play/pause button and a progress
// bar that runs from 0:00 to the length of the practice. When it finishes the practice is recorded once.
export function PracticeScreen() {
  const { t } = useTranslation()
  const { theme } = useUnistyles()
  const router = useRouter()
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>()
  const audio = usePracticeAudio()
  const {
    data,
    isPending,
    isFetching,
    refetch,
    elapsedSeconds,
    isPlaying,
    isFinished,
    playState,
    onPlayPress,
    pause,
    recordPractice,
    isSaving,
    hasSaveError,
    isSaved,
  } = usePracticeSession({ practiceId, audio })
  usePauseWhenBackgrounded(pause)

  const renderPlayIcon = () => {
    const layout = PRACTICE_LAYOUT
    if (isFinished) {
      return (
        <>
          <Path
            d={layout.REPLAY_ARC_PATH}
            fill="none"
            stroke={theme.colors.white}
            strokeWidth={layout.REPLAY_STROKE_WIDTH}
            strokeLinecap="round"
          />
          <Path d={layout.REPLAY_ARROW_PATH} fill={theme.colors.white} />
        </>
      )
    }
    if (isPlaying) {
      return [-1, 1].map((side) => (
        <Rect
          key={side}
          x={side * layout.PAUSE_BAR_OFFSET - layout.PAUSE_BAR_WIDTH / 2}
          y={-layout.PAUSE_BAR_HEIGHT / 2}
          width={layout.PAUSE_BAR_WIDTH}
          height={layout.PAUSE_BAR_HEIGHT}
          rx={layout.PAUSE_BAR_RADIUS}
          fill={theme.colors.white}
        />
      ))
    }
    return (
      <Path
        d={layout.PLAY_ICON_PATH}
        fill={theme.colors.white}
        stroke={theme.colors.white}
        strokeWidth={layout.PLAY_ICON_STROKE_WIDTH}
        strokeLinejoin="round"
      />
    )
  }

  const renderBody = () => {
    const layout = PRACTICE_LAYOUT
    if (!isPending && data === undefined) {
      return (
        <View style={styles.errorBlock}>
          <ErrorState
            message={t('common.loadError')}
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        </View>
      )
    }
    if (data === undefined) {
      return (
        <View style={styles.topBlock}>
          <View style={styles.iconCircle}>
            <Skeleton
              height={layout.ICON_CIRCLE_DIAMETER}
              radius={layout.ICON_CIRCLE_DIAMETER / 2}
            />
          </View>
          <View style={styles.skeletonTitle}>
            <Skeleton width={layout.SKELETON_TITLE_WIDTH} height={layout.SKELETON_TITLE_HEIGHT} />
          </View>
          {[0, 1, 2].map((line) => (
            <View key={line} style={styles.skeletonLine}>
              <Skeleton width={layout.SKELETON_LINE_WIDTH} height={layout.SKELETON_LINE_HEIGHT} />
            </View>
          ))}
        </View>
      )
    }
    return (
      <>
        <View style={styles.topBlock}>
          <View style={styles.iconCircle}>
            <Svg
              width={styles.iconSize.width}
              height={styles.iconSize.height}
              preserveAspectRatio="none"
              viewBox={`0 0 ${layout.ICON_VIEW_BOX_WIDTH} ${layout.ICON_VIEW_BOX_HEIGHT}`}
            >
              <Path
                d={layout.ICON_PATH}
                fill="none"
                stroke={theme.colors.practiceIcon}
                strokeWidth={layout.ICON_STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <AppText variant="title" testID={TEST_IDS.PRACTICE_TITLE} style={styles.title}>
            {data.title}
          </AppText>
          <AppText variant="body" testID={TEST_IDS.PRACTICE_DURATION} style={styles.subtitle}>
            {formatPracticeDuration(data.durationSeconds, t)}
          </AppText>
          <AppText variant="body" testID={TEST_IDS.PRACTICE_DESCRIPTION} style={styles.description}>
            {data.description}
          </AppText>
        </View>
        <View style={styles.bottomBlock}>
          {hasSaveError ? (
            <View testID={TEST_IDS.PRACTICE_SAVE_ERROR}>
              <ErrorState
                message={t('screen.practice.saveError')}
                onRetry={recordPractice}
                isRetrying={isSaving}
              />
            </View>
          ) : null}
          {isSaved ? (
            <AppText
              variant="body"
              testID={TEST_IDS.PRACTICE_DONE}
              accessibilityLiveRegion="polite"
              style={styles.message}
            >
              {t('screen.practice.done')}
            </AppText>
          ) : null}
          <Pressable
            testID={TEST_IDS.PRACTICE_PLAY_BUTTON}
            accessibilityRole="button"
            accessibilityLabel={t(PRACTICE_PLAY_LABEL_KEYS[playState])}
            onPress={onPlayPress}
            style={styles.playButton}
          >
            <Svg
              width={styles.playSize.width}
              height={styles.playSize.height}
              viewBox={`${-layout.PLAY_VIEW_BOX_SIZE / 2} ${-layout.PLAY_VIEW_BOX_SIZE / 2} ${layout.PLAY_VIEW_BOX_SIZE} ${layout.PLAY_VIEW_BOX_SIZE}`}
            >
              <Defs>
                <LinearGradient id={PRACTICE_PLAY_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={theme.colors.practicePlayTop} />
                  <Stop offset="1" stopColor={theme.colors.practicePlayBottom} />
                </LinearGradient>
              </Defs>
              <Circle
                cx={0}
                cy={0}
                r={layout.PLAY_DISC_DIAMETER / 2 + layout.PLAY_RING_WIDTH}
                fill={theme.colors.practicePlayRing}
              />
              <Circle
                cx={0}
                cy={0}
                r={layout.PLAY_DISC_DIAMETER / 2}
                fill={`url(#${PRACTICE_PLAY_GRADIENT_ID})`}
              />
              {renderPlayIcon()}
            </Svg>
          </Pressable>
          <View style={styles.progressRow}>
            <AppText
              variant="body"
              testID={TEST_IDS.PRACTICE_ELAPSED}
              style={[styles.label, styles.labelStart]}
            >
              {formatClock(elapsedSeconds)}
            </AppText>
            <View style={styles.progressBar}>
              <ProgressBar progress={elapsedSeconds / data.durationSeconds} />
            </View>
            <AppText
              variant="body"
              testID={TEST_IDS.PRACTICE_TOTAL}
              style={[styles.label, styles.labelEnd]}
            >
              {formatClock(data.durationSeconds)}
            </AppText>
          </View>
        </View>
      </>
    )
  }

  return (
    <View testID={TEST_IDS.PRACTICE_SCREEN} style={styles.screen}>
      <View pointerEvents="none" style={styles.waves}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${PRACTICE_LAYOUT.WAVE_VIEW_BOX_WIDTH} ${PRACTICE_LAYOUT.WAVE_BOTTOM - PRACTICE_LAYOUT.WAVE_TOP + PRACTICE_LAYOUT.WAVE_EXTRA_BOTTOM}`}
          preserveAspectRatio="none"
        >
          <Path d={PRACTICE_LAYOUT.WAVE_BLUE_PATH} fill={theme.colors.practiceWaveBlue} />
          <Path d={PRACTICE_LAYOUT.WAVE_PINK_PATH} fill={theme.colors.practiceWavePink} />
        </Svg>
      </View>
      <ScreenHeader
        title={t('screen.practice.headerTitle')}
        leftIcon="close"
        onLeftPress={() => router.back()}
        layout={PRACTICE_HEADER_LAYOUT}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderBody()}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const layout = PRACTICE_LAYOUT
  const metrics = AUTHENTICATION_FONT_METRICS

  const labelSize = layout.PROGRESS_LABEL_FONT_SIZE

  return {
    screen: { flex: 1, backgroundColor: theme.colors.practiceBackground },
    waves: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: runtime.insets.bottom - layout.WAVE_EXTRA_BOTTOM * scale,
      height: (layout.WAVE_BOTTOM - layout.WAVE_TOP + layout.WAVE_EXTRA_BOTTOM) * scale,
    },
    // The top block sits under the header and the player under it, anchored to the bottom; on a screen too
    // short for both, the gap collapses to its minimum and the page scrolls.
    scrollContent: { flexGrow: 1, justifyContent: 'space-between' },
    topBlock: { alignItems: 'center', marginTop: layout.ICON_TOP_GAP * scale },
    errorBlock: { marginTop: layout.ICON_TOP_GAP * scale },
    iconCircle: {
      width: layout.ICON_CIRCLE_DIAMETER * scale,
      height: layout.ICON_CIRCLE_DIAMETER * scale,
      borderRadius: (layout.ICON_CIRCLE_DIAMETER * scale) / 2,
      backgroundColor: theme.colors.practiceIconCircle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconSize: { width: layout.ICON_WIDTH * scale, height: layout.ICON_HEIGHT * scale },
    title: {
      marginTop: layout.TITLE_TOP_GAP * scale,
      fontSize: layout.TITLE_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
      textAlign: 'center',
    },
    subtitle: {
      marginTop: layout.SUBTITLE_TOP_GAP * scale,
      fontSize: layout.SUBTITLE_FONT_SIZE * scale,
      color: theme.colors.practiceSubtitle,
      textAlign: 'center',
    },
    description: {
      marginTop: layout.DESCRIPTION_TOP_GAP * scale,
      maxWidth: layout.DESCRIPTION_WIDTH * scale,
      fontSize: layout.DESCRIPTION_FONT_SIZE * scale,
      lineHeight: layout.DESCRIPTION_LINE_HEIGHT * scale,
      color: theme.colors.practiceDescription,
      textAlign: 'center',
    },
    skeletonTitle: { marginTop: layout.TITLE_TOP_GAP * scale },
    skeletonLine: { marginTop: layout.SKELETON_LINE_GAP * scale },
    bottomBlock: {
      alignItems: 'center',
      marginTop: layout.BOTTOM_MINIMUM_GAP * scale,
      marginBottom: runtime.insets.bottom + layout.BOTTOM_MARGIN * scale,
    },
    message: {
      marginBottom: layout.MESSAGE_BOTTOM_GAP * scale,
      fontSize: layout.MESSAGE_FONT_SIZE * scale,
      color: theme.colors.practiceSubtitle,
      textAlign: 'center',
    },
    playButton: { marginBottom: layout.PLAY_BOTTOM_GAP * scale },
    playSize: {
      width: layout.PLAY_VIEW_BOX_SIZE * scale,
      height: layout.PLAY_VIEW_BOX_SIZE * scale,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      marginHorizontal: layout.PROGRESS_SIDE_MARGIN * scale,
    },
    progressBar: { flex: 1, marginHorizontal: layout.PROGRESS_LABEL_GAP * scale },
    label: {
      minWidth: layout.PROGRESS_LABEL_MINIMUM_WIDTH * scale,
      fontSize: labelSize * scale,
      lineHeight: labelSize * (metrics.BODY_ASCENT + metrics.BODY_DESCENT) * scale,
      color: theme.colors.practiceLabel,
    },
    labelStart: { textAlign: 'left' },
    labelEnd: { textAlign: 'right' },
  }
})

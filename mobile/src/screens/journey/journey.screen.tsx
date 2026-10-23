import {
  JOURNEY_SEGMENT_KEYS,
  JOURNEY_SEGMENTS,
  type JourneyAchievement,
  type JourneySegmentKey,
  TEST_IDS,
  useJourneyOverview,
} from '@clavis-via/shared'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, Pressable, ScrollView, useWindowDimensions, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import type { ScrollViewHandle } from '../../@types/component.type'
import { AchievementList } from '../../components/achievement-list/achievement-list.component'
import { AppText } from '../../components/app-text/app-text.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { SegmentedControl } from '../../components/segmented-control/segmented-control.component'
import { Skeleton } from '../../components/skeleton/skeleton.component'
import { StreakCard } from '../../components/streak-card/streak-card.component'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { DESIGN } from '../../constants/design.constant'
import {
  JOURNEY_ACHIEVEMENTS_LAYOUT,
  JOURNEY_LAYOUT,
  JOURNEY_PHRASE_LAYOUT,
  JOURNEY_ROW_METRICS,
  JOURNEY_SEGMENTS_LAYOUT,
  JOURNEY_SKELETON_LAYOUT,
  JOURNEY_STREAK_LAYOUT,
} from '../../constants/journey-layout.constant'
import { ROUTES } from '../../constants/route.constant'
import { TAB_BAR_LAYOUT } from '../../constants/tab-bar.constant'
import { useComingSoon } from '../../hooks/feedback/use-coming-soon'
import { scaleDesignValue } from '../../utils/design'

const ILLUSTRATION = require('../../../assets/images/journey-phrase-illustration.png')

// Design row where the content below the achievements heading starts, used to size the scrollable area.
const ACHIEVEMENTS_HEADING_TOP =
  JOURNEY_ACHIEVEMENTS_LAYOUT.HEADING_BASELINE -
  AUTHENTICATION_FONT_METRICS.TITLE_ASCENT * JOURNEY_ACHIEVEMENTS_LAYOUT.HEADING_FONT_SIZE

// Minha jornada: the streak of consecutive days with the dots of the week, a phrase and the achievements the API
// computed from the check-ins, plans, practices and actions. The tab bar is drawn over the screen, so the content
// reserves its height and scrolls.
export function JourneyScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const showComingSoon = useComingSoon()
  const { data, isPending, isError, isFetching, refetch } = useJourneyOverview()

  const scrollReference = useRef<ScrollViewHandle>(null)
  const [selectedKey, setSelectedKey] = useState<JourneySegmentKey>(JOURNEY_SEGMENT_KEYS.OVERVIEW)

  const handleSegmentSelect = (key: string) => {
    if (key === JOURNEY_SEGMENT_KEYS.EMOTIONS) {
      router.push(ROUTES.EMOTIONS)
      return
    }
    setSelectedKey(key as JourneySegmentKey)
    scrollReference.current?.scrollTo({
      y:
        key === JOURNEY_SEGMENT_KEYS.ACHIEVEMENTS
          ? (ACHIEVEMENTS_HEADING_TOP - DESIGN.STATUS_BAR_HEIGHT) * scaleDesignValue(1, width)
          : 0,
      animated: true,
    })
  }

  // The last design row the content reaches; it sizes the scrollable area.
  let contentBottom = JOURNEY_ACHIEVEMENTS_LAYOUT.LIST_TOP
  if (isPending) {
    contentBottom += JOURNEY_SKELETON_LAYOUT.ROW_KEYS.length * JOURNEY_ROW_METRICS.HEIGHT
  } else if (isError) {
    contentBottom = JOURNEY_STREAK_LAYOUT.TOP + JOURNEY_STREAK_LAYOUT.HEIGHT
  } else if (data.achievements.length === 0) {
    contentBottom = JOURNEY_ACHIEVEMENTS_LAYOUT.EMPTY_TOP + JOURNEY_ACHIEVEMENTS_LAYOUT.EMPTY_HEIGHT
  } else {
    contentBottom += data.achievements.length * JOURNEY_ROW_METRICS.HEIGHT
  }

  const renderBody = () => {
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
    return (
      <>
        <View style={styles.streak}>
          {isPending ? (
            <Skeleton height={JOURNEY_STREAK_LAYOUT.HEIGHT} radius={JOURNEY_STREAK_LAYOUT.RADIUS} />
          ) : (
            <StreakCard
              streakDays={data.streakDays}
              week={data.week}
              onCalendarPress={showComingSoon}
            />
          )}
        </View>
        <View testID={TEST_IDS.JOURNEY_PHRASE} style={styles.phrase}>
          <View style={styles.phraseTile}>
            <Image
              testID={TEST_IDS.JOURNEY_PHRASE_ILLUSTRATION}
              source={ILLUSTRATION}
              resizeMode="contain"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.illustration}
            />
          </View>
          <AppText variant="body" style={styles.phraseText}>
            {t('screen.journey.phrase')}
          </AppText>
        </View>
        <AppText variant="titleMedium" accessibilityRole="header" style={styles.heading}>
          {t('screen.journey.achievementsTitle')}
        </AppText>
        <Pressable
          testID={TEST_IDS.JOURNEY_VIEW_ALL}
          accessibilityRole="button"
          hitSlop={JOURNEY_ACHIEVEMENTS_LAYOUT.VIEW_ALL_HIT_SLOP}
          onPress={showComingSoon}
          style={styles.viewAll}
        >
          <AppText variant="titleMedium" style={styles.viewAllText}>
            {t('screen.journey.viewAll')}
          </AppText>
        </Pressable>
        <View style={styles.list}>{renderAchievements(data?.achievements)}</View>
      </>
    )
  }

  const renderAchievements = (achievements: readonly JourneyAchievement[] | undefined) => {
    if (achievements === undefined) {
      return (
        <View testID={TEST_IDS.JOURNEY_SKELETON} style={styles.skeletonRows}>
          {JOURNEY_SKELETON_LAYOUT.ROW_KEYS.map((rowKey) => (
            <Skeleton
              key={rowKey}
              height={JOURNEY_SKELETON_LAYOUT.ROW_HEIGHT}
              radius={JOURNEY_SKELETON_LAYOUT.ROW_RADIUS}
            />
          ))}
        </View>
      )
    }
    if (achievements.length === 0) {
      return (
        <AppText variant="body" testID={TEST_IDS.JOURNEY_ACHIEVEMENTS_EMPTY} style={styles.empty}>
          {t('screen.journey.empty')}
        </AppText>
      )
    }
    return <AchievementList achievements={achievements} onAchievementPress={showComingSoon} />
  }

  return (
    <View testID={TEST_IDS.JOURNEY_SCREEN} style={styles.screen}>
      <ScrollView ref={scrollReference} contentContainerStyle={styles.content(contentBottom)}>
        <AppText variant="title" accessibilityRole="header" style={styles.title}>
          {t('screen.journey.title')}
        </AppText>
        <View style={styles.segments}>
          <SegmentedControl
            segments={JOURNEY_SEGMENTS.map((segment) => ({
              key: segment.key,
              label: t(segment.labelKey),
            }))}
            selectedKey={selectedKey}
            onSelect={handleSegmentSelect}
            variant="solid"
            solidLayout={JOURNEY_SEGMENTS_LAYOUT}
            testIDPrefix={TEST_IDS.JOURNEY_SEGMENT_PREFIX}
          />
        </View>
        {renderBody()}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const topOf = (designY: number) =>
    runtime.insets.top + (designY - DESIGN.STATUS_BAR_HEIGHT) * scale
  const titleTop = (baseline: number, fontSize: number) =>
    topOf(baseline - AUTHENTICATION_FONT_METRICS.TITLE_ASCENT * fontSize)
  const phrase = JOURNEY_PHRASE_LAYOUT
  const achievements = JOURNEY_ACHIEVEMENTS_LAYOUT
  const tileGradientStops = theme.colors.journeyPhraseTileGradient
    .map((stop) => `${stop.color} ${stop.offset * 100}%`)
    .join(', ')

  return {
    screen: { flex: 1, backgroundColor: theme.colors.homeBackground },
    content: (bottomY: number) => ({
      height:
        topOf(bottomY) +
        JOURNEY_LAYOUT.CONTENT_BOTTOM_GAP * scale +
        TAB_BAR_LAYOUT.BAR_HEIGHT * scale +
        runtime.insets.bottom,
    }),
    title: {
      position: 'absolute',
      left: JOURNEY_LAYOUT.TITLE_LEFT * scale,
      top: titleTop(JOURNEY_LAYOUT.TITLE_BASELINE, JOURNEY_LAYOUT.TITLE_FONT_SIZE),
      fontSize: JOURNEY_LAYOUT.TITLE_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    segments: {
      position: 'absolute',
      left: JOURNEY_SEGMENTS_LAYOUT.LEFT * scale,
      top: topOf(JOURNEY_SEGMENTS_LAYOUT.TOP),
    },
    streak: {
      position: 'absolute',
      left: JOURNEY_STREAK_LAYOUT.LEFT * scale,
      right: JOURNEY_STREAK_LAYOUT.RIGHT * scale,
      top: topOf(JOURNEY_STREAK_LAYOUT.TOP),
      height: JOURNEY_STREAK_LAYOUT.HEIGHT * scale,
    },
    error: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: topOf(JOURNEY_STREAK_LAYOUT.TOP),
    },
    phrase: {
      position: 'absolute',
      left: phrase.LEFT * scale,
      right: phrase.RIGHT * scale,
      top: topOf(phrase.TOP),
      height: phrase.HEIGHT * scale,
      borderRadius: phrase.RADIUS * scale,
      backgroundColor: theme.colors.homeCardBackground,
      boxShadow: `0 ${2 * scale}px ${8 * scale}px ${theme.colors.planCardShadow}`,
    },
    phraseTile: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: phrase.TILE_WIDTH * scale,
      borderRadius: phrase.TILE_RADIUS * scale,
      backgroundColor: theme.colors.journeyPhraseTileGradient[0].color,
      experimental_backgroundImage: `linear-gradient(45deg, ${tileGradientStops})`,
    },
    illustration: {
      position: 'absolute',
      left: phrase.ILLUSTRATION_LEFT * scale,
      top: phrase.ILLUSTRATION_TOP * scale,
      width: phrase.ILLUSTRATION_WIDTH * scale,
      height: phrase.ILLUSTRATION_HEIGHT * scale,
    },
    phraseText: {
      position: 'absolute',
      left: phrase.TEXT_LEFT * scale,
      width: phrase.TEXT_WIDTH * scale,
      top:
        (phrase.TEXT_FIRST_BASELINE -
          AUTHENTICATION_FONT_METRICS.BODY_ASCENT * phrase.TEXT_FONT_SIZE) *
        scale,
      fontSize: phrase.TEXT_FONT_SIZE * scale,
      lineHeight: phrase.TEXT_LINE_PITCH * scale,
      color: theme.colors.body,
    },
    heading: {
      position: 'absolute',
      left: achievements.HEADING_LEFT * scale,
      top: titleTop(achievements.HEADING_BASELINE, achievements.HEADING_FONT_SIZE),
      fontSize: achievements.HEADING_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    viewAll: {
      position: 'absolute',
      right: achievements.HEADING_RIGHT * scale,
      top: titleTop(achievements.VIEW_ALL_BASELINE, achievements.VIEW_ALL_FONT_SIZE),
    },
    viewAllText: {
      fontSize: achievements.VIEW_ALL_FONT_SIZE * scale,
      color: theme.colors.journeyLink,
      textDecorationLine: 'underline',
    },
    list: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: topOf(achievements.LIST_TOP),
    },
    skeletonRows: {
      marginLeft: JOURNEY_SKELETON_LAYOUT.ROW_LEFT * scale,
      marginRight: JOURNEY_SKELETON_LAYOUT.ROW_RIGHT * scale,
      rowGap: (JOURNEY_ROW_METRICS.HEIGHT - JOURNEY_SKELETON_LAYOUT.ROW_HEIGHT) * scale,
    },
    empty: {
      marginTop: (achievements.EMPTY_TOP - achievements.LIST_TOP) * scale,
      marginLeft: achievements.EMPTY_LEFT * scale,
      marginRight: achievements.EMPTY_RIGHT * scale,
      fontSize: achievements.EMPTY_FONT_SIZE * scale,
      color: theme.colors.body,
    },
  }
})

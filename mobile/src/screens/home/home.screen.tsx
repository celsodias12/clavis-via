import {
  BRAND_KEY_METRICS,
  GREETING_KEYS,
  greetingPeriod,
  TEST_IDS,
  useCurrentPlan,
  useNow,
  useTodayCheckIn,
  useVerseOfDay,
} from '@clavis-via/shared'
import { useUser } from '@clerk/expo'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { AppText } from '../../components/app-text/app-text.component'
import { BrandKey } from '../../components/brand-key/brand-key.component'
import { CurrentPlanCard } from '../../components/current-plan-card/current-plan-card.component'
import { DailyKeyCard } from '../../components/daily-key-card/daily-key-card.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { HeaderIconButton } from '../../components/header-icon-button/header-icon-button.component'
import { Skeleton } from '../../components/skeleton/skeleton.component'
import { UserAvatar } from '../../components/user-avatar/user-avatar.component'
import { VerseCard } from '../../components/verse-card/verse-card.component'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { HEADER_ICON_METRICS, HEADER_ICON_STYLES } from '../../constants/component.constant'
import { DESIGN } from '../../constants/design.constant'
import {
  CURRENT_PLAN_CARD_LAYOUT,
  DAILY_KEY_CARD_LAYOUT,
  HOME_CONTENT_LAYOUT,
  HOME_GREETING_LAYOUT,
  HOME_HEADER_LAYOUT,
  VERSE_CARD_LAYOUT,
} from '../../constants/home-layout.constant'
import { ROUTES } from '../../constants/route.constant'
import { TAB_BAR_LAYOUT } from '../../constants/tab-bar.constant'
import { WELCOME_FONT_METRICS } from '../../constants/welcome.constant'
import { useComingSoon } from '../../hooks/feedback/use-coming-soon'
import { scaleDesignValue } from '../../utils/design'

// Início: header, greeting and three cards (today's key, the verse of the day and the plan in progress), each
// with its own loading and error state. The tab bar is drawn over the screen, so the content reserves its height
// and scrolls when the screen is shorter than the design.
export function HomeScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useUser()
  const { width } = useWindowDimensions()
  const showComingSoon = useComingSoon()
  const now = useNow()
  const { data, isPending, isError, isFetching, refetch } = useTodayCheckIn()
  const verse = useVerseOfDay()
  const currentPlan = useCurrentPlan()

  const firstName = user?.firstName?.trim()
  const avatarSize = scaleDesignValue(HOME_HEADER_LAYOUT.AVATAR_DIAMETER, width)
  const brandWords = t('welcome.brand').split(' ')
  const greetingKeys = GREETING_KEYS[greetingPeriod(now)]

  const renderKeyCard = () => {
    if (isPending) {
      return (
        <Skeleton height={DAILY_KEY_CARD_LAYOUT.HEIGHT} radius={DAILY_KEY_CARD_LAYOUT.RADIUS} />
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
    if (data === null) {
      return (
        <DailyKeyCard
          label={t('screen.home.keyLabel')}
          title={t('screen.home.inviteTitle')}
          text={t('screen.home.inviteText')}
          buttonLabel={t('screen.home.inviteButton')}
          onButtonPress={() => router.push(ROUTES.CHECK_IN)}
        />
      )
    }
    return (
      <DailyKeyCard
        label={t('screen.home.keyLabel')}
        title={data.dailyKey.title}
        text={data.dailyKey.text}
        buttonLabel={t('screen.home.practiceButton')}
        onButtonPress={() =>
          router.push({
            pathname: ROUTES.PRACTICE,
            params: { practiceId: data.dailyKey.practice.id },
          })
        }
      />
    )
  }

  const renderVerseCard = () => {
    if (verse.isPending) {
      return <Skeleton height={VERSE_CARD_LAYOUT.HEIGHT} radius={VERSE_CARD_LAYOUT.RADIUS} />
    }
    if (verse.isError) {
      return (
        <ErrorState
          message={t('common.loadError')}
          onRetry={() => verse.refetch()}
          isRetrying={verse.isFetching}
        />
      )
    }
    return (
      <VerseCard
        text={verse.data.text}
        reference={verse.data.reference}
        onPlayPress={showComingSoon}
      />
    )
  }

  const renderCurrentPlanCard = () => {
    if (currentPlan.isPending) {
      return (
        <Skeleton
          height={CURRENT_PLAN_CARD_LAYOUT.HEIGHT}
          radius={CURRENT_PLAN_CARD_LAYOUT.RADIUS}
        />
      )
    }
    if (currentPlan.isError) {
      return (
        <ErrorState
          message={t('common.loadError')}
          onRetry={() => currentPlan.refetch()}
          isRetrying={currentPlan.isFetching}
        />
      )
    }
    const plan = currentPlan.data
    return (
      <CurrentPlanCard
        plan={plan}
        onPress={() =>
          router.push(
            plan ? { pathname: ROUTES.PLAN, params: { planId: plan.planId } } : ROUTES.PLANS,
          )
        }
      />
    )
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.key}>
        <BrandKey width={HOME_HEADER_LAYOUT.KEY_WIDTH} />
      </View>
      <View
        accessible
        accessibilityLabel={t('welcome.brand')}
        accessibilityRole="header"
        style={styles.brand}
      >
        {brandWords.map((word, index) => (
          <AppText
            key={word}
            variant="brand"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.brandWord(index)}
          >
            {word}
          </AppText>
        ))}
      </View>
      <View style={styles.bell}>
        <HeaderIconButton
          icon="bell"
          onPress={showComingSoon}
          accessibilityLabel={t('screen.home.notifications')}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('screen.home.profile')}
        hitSlop={HOME_HEADER_LAYOUT.AVATAR_HIT_SLOP}
        onPress={() => router.push(ROUTES.PROFILE)}
        style={styles.avatar}
      >
        <UserAvatar size={avatarSize} />
      </Pressable>
      <AppText
        variant="titleMedium"
        testID={TEST_IDS.HOME_GREETING}
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.greeting}
      >
        {t(firstName ? greetingKeys.named : greetingKeys.anonymous, { name: firstName })}
      </AppText>
      <AppText variant="body" style={styles.subtitle}>
        {t('screen.home.subtitle')}
      </AppText>
      <View style={styles.cardSlot}>{renderKeyCard()}</View>
      <View style={styles.verseSlot}>{renderVerseCard()}</View>
      <View style={styles.planSlot}>{renderCurrentPlanCard()}</View>
    </ScrollView>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const topOf = (designY: number) =>
    runtime.insets.top + (designY - DESIGN.STATUS_BAR_HEIGHT) * scale
  const keyWidth = HOME_HEADER_LAYOUT.KEY_WIDTH * scale
  const keyHeight =
    (keyWidth * BRAND_KEY_METRICS.VIEW_BOX_HEIGHT) / BRAND_KEY_METRICS.VIEW_BOX_WIDTH
  const bellHalfSize =
    Math.max(HEADER_ICON_METRICS.MINIMUM_TOUCH_SIZE, HEADER_ICON_STYLES.bell.size * scale) / 2
  const avatarSize = HOME_HEADER_LAYOUT.AVATAR_DIAMETER * scale
  const brandSize = HOME_HEADER_LAYOUT.BRAND_FONT_SIZE
  const greetingSize = HOME_GREETING_LAYOUT.GREETING_FONT_SIZE
  const subtitleSize = HOME_GREETING_LAYOUT.SUBTITLE_FONT_SIZE

  return {
    screen: { flex: 1, backgroundColor: theme.colors.homeBackground },
    // Everything is placed from the design: the content ends below the last card plus the tab bar.
    content: {
      height:
        topOf(CURRENT_PLAN_CARD_LAYOUT.TOP + CURRENT_PLAN_CARD_LAYOUT.HEIGHT) +
        (HOME_CONTENT_LAYOUT.BOTTOM_GAP + TAB_BAR_LAYOUT.BAR_HEIGHT) * scale +
        runtime.insets.bottom,
    },
    key: {
      position: 'absolute',
      left: HOME_HEADER_LAYOUT.KEY_CENTER_X * scale - keyWidth / 2,
      top: topOf(HOME_HEADER_LAYOUT.KEY_CENTER_Y) - keyHeight / 2,
    },
    // The words are positioned from the brand box, which starts at the top of the text line box.
    brand: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: topOf(HOME_HEADER_LAYOUT.BRAND_BASELINE - WELCOME_FONT_METRICS.BRAND_ASCENT * brandSize),
    },
    brandWord: (index: number) => ({
      position: 'absolute',
      left: HOME_HEADER_LAYOUT.BRAND_WORDS[index].left * scale,
      fontSize: brandSize * scale,
      letterSpacing: HOME_HEADER_LAYOUT.BRAND_WORDS[index].letterSpacing * scale,
      color: theme.colors.homeBrandText,
    }),
    bell: {
      position: 'absolute',
      left: HOME_HEADER_LAYOUT.BELL_CENTER_X * scale - bellHalfSize,
      top: topOf(HOME_HEADER_LAYOUT.BELL_CENTER_Y) - bellHalfSize,
    },
    avatar: {
      position: 'absolute',
      left: HOME_HEADER_LAYOUT.AVATAR_CENTER_X * scale - avatarSize / 2,
      top: topOf(HOME_HEADER_LAYOUT.AVATAR_CENTER_Y) - avatarSize / 2,
    },
    greeting: {
      position: 'absolute',
      left: HOME_GREETING_LAYOUT.GREETING_LEFT * scale,
      right: HOME_GREETING_LAYOUT.GREETING_RIGHT * scale,
      top: topOf(
        HOME_GREETING_LAYOUT.GREETING_BASELINE -
          AUTHENTICATION_FONT_METRICS.TITLE_ASCENT * greetingSize,
      ),
      fontSize: greetingSize * scale,
      color: theme.colors.homeHeading,
    },
    subtitle: {
      position: 'absolute',
      left: HOME_GREETING_LAYOUT.SUBTITLE_LEFT * scale,
      top: topOf(
        HOME_GREETING_LAYOUT.SUBTITLE_BASELINE -
          AUTHENTICATION_FONT_METRICS.BODY_ASCENT * subtitleSize,
      ),
      fontSize: subtitleSize * scale,
      color: theme.colors.body,
    },
    cardSlot: {
      position: 'absolute',
      left: DAILY_KEY_CARD_LAYOUT.LEFT * scale,
      right: DAILY_KEY_CARD_LAYOUT.RIGHT * scale,
      top: topOf(DAILY_KEY_CARD_LAYOUT.TOP),
      height: DAILY_KEY_CARD_LAYOUT.HEIGHT * scale,
      justifyContent: 'center',
    },
    verseSlot: {
      position: 'absolute',
      left: VERSE_CARD_LAYOUT.LEFT * scale,
      right: VERSE_CARD_LAYOUT.RIGHT * scale,
      top: topOf(VERSE_CARD_LAYOUT.TOP),
      height: VERSE_CARD_LAYOUT.HEIGHT * scale,
      justifyContent: 'center',
    },
    planSlot: {
      position: 'absolute',
      left: CURRENT_PLAN_CARD_LAYOUT.LEFT * scale,
      right: CURRENT_PLAN_CARD_LAYOUT.RIGHT * scale,
      top: topOf(CURRENT_PLAN_CARD_LAYOUT.TOP),
      height: CURRENT_PLAN_CARD_LAYOUT.HEIGHT * scale,
      justifyContent: 'center',
    },
  }
})

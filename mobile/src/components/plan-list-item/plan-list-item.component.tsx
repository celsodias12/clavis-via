import { type PlanSummary, TEST_IDS } from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { Image, Pressable, useWindowDimensions, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { DESIGN } from '../../constants/design.constant'
import { PLAN_LIST_ITEM_LAYOUT } from '../../constants/plans-layout.constant'
import { scaleDesignValue } from '../../utils/design'
import { planImages } from '../../utils/plan-images'
import { AppText } from '../app-text/app-text.component'

type PlanListItemProps = Readonly<{
  plan: PlanSummary
  onPress: () => void
}>

// One card of the plan list: photo on the left, title (up to two lines) with the duration, and an arrow.
export function PlanListItem({ plan, onPress }: PlanListItemProps) {
  const { t } = useTranslation()
  const { theme } = useUnistyles()
  const { width } = useWindowDimensions()

  const chevronSize = scaleDesignValue(PLAN_LIST_ITEM_LAYOUT.CHEVRON_SIZE, width)
  const { thumbnail } = planImages(plan.id)
  // Static assets know their size in design units; the fallback image is stretched to a default photo box.
  const photo = Image.resolveAssetSource(thumbnail)
  const photoWidth = photo?.width ?? PLAN_LIST_ITEM_LAYOUT.FALLBACK_PHOTO_WIDTH
  const photoHeight = photo?.height ?? PLAN_LIST_ITEM_LAYOUT.FALLBACK_PHOTO_HEIGHT

  return (
    <Pressable
      testID={`${TEST_IDS.PLANS_ITEM_PREFIX}${plan.id}`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.card(photoHeight)}
    >
      <Image
        source={thumbnail}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.photo(photoWidth, photoHeight)}
      />
      <View pointerEvents="none" style={styles.fade(photoWidth)} />
      <View style={styles.texts}>
        <AppText
          variant="titleMedium"
          numberOfLines={PLAN_LIST_ITEM_LAYOUT.TITLE_MAXIMUM_LINES}
          textBreakStrategy="balanced"
          style={styles.title}
        >
          {plan.title}
        </AppText>
        <AppText variant="title" style={styles.duration}>
          {t('screen.plans.duration', { count: plan.totalDays })}
        </AppText>
      </View>
      <Svg
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        width={chevronSize}
        height={chevronSize}
        viewBox={`0 0 ${PLAN_LIST_ITEM_LAYOUT.CHEVRON_VIEW_BOX_SIZE} ${PLAN_LIST_ITEM_LAYOUT.CHEVRON_VIEW_BOX_SIZE}`}
        style={styles.chevron(photoHeight)}
      >
        <Path
          d={PLAN_LIST_ITEM_LAYOUT.CHEVRON_PATH}
          fill="none"
          stroke={theme.colors.body}
          strokeWidth={PLAN_LIST_ITEM_LAYOUT.CHEVRON_STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const layout = PLAN_LIST_ITEM_LAYOUT
  const cardHeightOf = (photoHeight: number) => photoHeight + 2 * layout.PHOTO_INSET_TOP

  return {
    card: (photoHeight: number) => ({
      height: cardHeightOf(photoHeight) * scale,
      borderRadius: layout.RADIUS * scale,
      backgroundColor: theme.colors.homeBackground,
      boxShadow: `0 1 ${6 * scale} ${theme.colors.planCardShadow}`,
    }),
    photo: (photoWidth: number, photoHeight: number) => ({
      position: 'absolute',
      left: layout.PHOTO_LEFT * scale,
      top: layout.PHOTO_INSET_TOP * scale,
      width: photoWidth * scale,
      height: photoHeight * scale,
      borderTopLeftRadius: layout.PHOTO_RADIUS * scale,
      borderBottomLeftRadius: layout.PHOTO_RADIUS * scale,
    }),
    fade: (photoWidth: number) => ({
      position: 'absolute',
      left: (layout.PHOTO_LEFT + photoWidth - layout.PHOTO_FADE_WIDTH) * scale,
      top: 0,
      bottom: 0,
      width: layout.PHOTO_FADE_WIDTH * scale,
      // Same color as the card, fully transparent at the start so the photo melts into it.
      experimental_backgroundImage: `linear-gradient(90deg, ${theme.colors.homeBackground}00, ${theme.colors.homeBackground})`,
    }),
    texts: {
      position: 'absolute',
      left: layout.TEXT_LEFT * scale,
      width: layout.TEXT_WIDTH * scale,
      top: layout.TEXT_OFFSET_TOP * scale,
      bottom: 0,
      justifyContent: 'center',
    },
    title: {
      fontSize: layout.TITLE_FONT_SIZE * scale,
      lineHeight: layout.TITLE_LINE_HEIGHT * scale,
      color: theme.colors.homeHeading,
    },
    duration: {
      marginTop: layout.DURATION_TOP_GAP * scale,
      fontSize: layout.DURATION_FONT_SIZE * scale,
      lineHeight: layout.TITLE_LINE_HEIGHT * scale,
      color: theme.colors.title,
    },
    chevron: (photoHeight: number) => ({
      position: 'absolute',
      right: (layout.CHEVRON_CENTER_RIGHT - layout.CHEVRON_SIZE / 2) * scale,
      top:
        (cardHeightOf(photoHeight) * layout.CHEVRON_CENTER_RATIO - layout.CHEVRON_SIZE / 2) * scale,
    }),
  }
})

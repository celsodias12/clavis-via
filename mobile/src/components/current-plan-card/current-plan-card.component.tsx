import { type CurrentPlan, TEST_IDS } from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { DESIGN } from '../../constants/design.constant'
import { CURRENT_PLAN_CARD_LAYOUT } from '../../constants/home-layout.constant'
import { AppText } from '../app-text/app-text.component'
import { ProgressBar } from '../progress-bar/progress-bar.component'

type CurrentPlanCardProps = Readonly<{
  // The plan in progress, or null when there is none (the card then invites to pick one).
  plan: CurrentPlan | null
  onPress: () => unknown
}>

// The "Continue sua jornada" card: the plan in progress with its next day and how far the person has gone.
// The parent gives it the card box; everything inside is placed from the reference measurements.
export function CurrentPlanCard({ plan, onPress }: CurrentPlanCardProps) {
  const { t } = useTranslation()
  const { theme } = useUnistyles()

  return (
    <Pressable
      testID={TEST_IDS.HOME_CURRENT_PLAN}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.card}
    >
      <AppText variant="titleMedium" numberOfLines={1} style={styles.title}>
        {t('screen.home.journeyTitle')}
      </AppText>
      <AppText variant="body" numberOfLines={1} style={styles.name}>
        {plan ? plan.title : t('screen.home.journeyEmpty')}
      </AppText>
      {plan ? (
        <>
          <AppText variant="body" numberOfLines={1} style={styles.day}>
            {t('screen.home.journeyDay', { number: plan.nextDayNumber, total: plan.totalDays })}
          </AppText>
          <View style={styles.bar}>
            <ProgressBar
              variant="card"
              progress={plan.completedDays / plan.totalDays}
              accessibilityLabel={t('screen.home.journeyProgress')}
            />
          </View>
        </>
      ) : null}
      <Svg
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        viewBox={`0 0 ${CURRENT_PLAN_CARD_LAYOUT.CHEVRON_WIDTH} ${CURRENT_PLAN_CARD_LAYOUT.CHEVRON_HEIGHT}`}
        style={styles.chevron}
      >
        <Path
          d={CURRENT_PLAN_CARD_LAYOUT.CHEVRON_PATH}
          fill="none"
          stroke={theme.colors.homeChevron}
          strokeWidth={CURRENT_PLAN_CARD_LAYOUT.CHEVRON_STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const layout = CURRENT_PLAN_CARD_LAYOUT
  // Line-box top of a text whose baseline is `baseline` design units below the card top.
  const topOf = (baseline: number, ascent: number, fontSize: number) =>
    (baseline - ascent * fontSize) * scale

  return {
    card: {
      flex: 1,
      borderRadius: layout.RADIUS * scale,
      backgroundColor: theme.colors.homeCardBackground,
      boxShadow: `0 1 ${6 * scale} ${theme.colors.homeCardShadow}`,
    },
    title: {
      position: 'absolute',
      left: layout.TITLE_LEFT * scale,
      right: layout.CHEVRON_RIGHT * scale,
      top: topOf(
        layout.TITLE_BASELINE,
        AUTHENTICATION_FONT_METRICS.TITLE_ASCENT,
        layout.TITLE_FONT_SIZE,
      ),
      fontSize: layout.TITLE_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    name: {
      position: 'absolute',
      left: layout.NAME_LEFT * scale,
      right: (layout.CHEVRON_RIGHT + layout.CHEVRON_WIDTH + layout.NAME_CHEVRON_GAP) * scale,
      top: topOf(
        layout.NAME_BASELINE,
        AUTHENTICATION_FONT_METRICS.BODY_ASCENT,
        layout.NAME_FONT_SIZE,
      ),
      fontSize: layout.NAME_FONT_SIZE * scale,
      color: theme.colors.body,
    },
    day: {
      position: 'absolute',
      left: layout.NAME_LEFT * scale,
      right: layout.CHEVRON_RIGHT * scale,
      top: topOf(
        layout.DAY_BASELINE,
        AUTHENTICATION_FONT_METRICS.BODY_ASCENT,
        layout.DAY_FONT_SIZE,
      ),
      fontSize: layout.DAY_FONT_SIZE * scale,
      color: theme.colors.body,
    },
    bar: {
      position: 'absolute',
      left: layout.BAR_LEFT * scale,
      right: layout.BAR_RIGHT * scale,
      top: layout.BAR_TOP * scale,
    },
    chevron: {
      position: 'absolute',
      right: layout.CHEVRON_RIGHT * scale,
      top: layout.CHEVRON_TOP * scale,
      width: layout.CHEVRON_WIDTH * scale,
      height: layout.CHEVRON_HEIGHT * scale,
    },
  }
})

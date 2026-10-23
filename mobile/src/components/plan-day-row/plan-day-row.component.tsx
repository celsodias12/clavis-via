import { TEST_IDS } from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { Pressable, useWindowDimensions, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { DESIGN } from '../../constants/design.constant'
import { PLAN_DAY_ROW_LAYOUT } from '../../constants/plan-layout.constant'
import { PLAN_LIST_ITEM_LAYOUT } from '../../constants/plans-layout.constant'
import { scaleDesignValue } from '../../utils/design'
import { AppText } from '../app-text/app-text.component'

type PlanDayRowProps = Readonly<{
  dayNumber: number
  title: string
  isCompleted: boolean
  // True for every row but the last of the panel: a hairline separates it from the next one.
  hasSeparator?: boolean
  onPress: () => void
}>

// One day of the plan: a circle with the day number (a check once the day is done), "Dia N", its title and an arrow.
export function PlanDayRow({
  dayNumber,
  title,
  isCompleted,
  hasSeparator = false,
  onPress,
}: PlanDayRowProps) {
  const { t } = useTranslation()
  const { theme } = useUnistyles()
  const { width } = useWindowDimensions()

  const chevronSize = scaleDesignValue(PLAN_LIST_ITEM_LAYOUT.CHEVRON_SIZE, width)
  const checkSize = scaleDesignValue(PLAN_DAY_ROW_LAYOUT.CHECK_SIZE, width)
  const rowTestID = `${TEST_IDS.PLAN_DAY_ROW_PREFIX}${dayNumber}`
  const dayLabel = t('screen.plan.dayLabel', { number: dayNumber })

  return (
    <Pressable
      testID={rowTestID}
      accessibilityRole="button"
      accessibilityLabel={`${dayLabel}. ${title}`}
      accessibilityState={{ checked: isCompleted }}
      onPress={onPress}
      style={styles.row}
    >
      <View style={styles.circle}>
        {isCompleted ? (
          <Svg
            testID={`${rowTestID}${TEST_IDS.PLAN_DAY_ROW_COMPLETED_SUFFIX}`}
            accessibilityLabel={t('screen.plan.dayCompleted')}
            width={checkSize}
            height={checkSize}
            viewBox={`0 0 ${PLAN_DAY_ROW_LAYOUT.CHECK_VIEW_BOX_SIZE} ${PLAN_DAY_ROW_LAYOUT.CHECK_VIEW_BOX_SIZE}`}
          >
            <Path
              d={PLAN_DAY_ROW_LAYOUT.CHECK_PATH}
              fill="none"
              stroke={theme.colors.planAccent}
              strokeWidth={PLAN_DAY_ROW_LAYOUT.CHECK_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : (
          <AppText variant="body" style={styles.number}>
            {dayNumber}
          </AppText>
        )}
      </View>
      <View style={styles.texts}>
        <AppText variant="bodySemiBold" style={styles.dayLabel}>
          {dayLabel}
        </AppText>
        <AppText variant="body" numberOfLines={1} style={styles.title}>
          {title}
        </AppText>
      </View>
      <Svg
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        width={chevronSize}
        height={chevronSize}
        viewBox={`0 0 ${PLAN_LIST_ITEM_LAYOUT.CHEVRON_VIEW_BOX_SIZE} ${PLAN_LIST_ITEM_LAYOUT.CHEVRON_VIEW_BOX_SIZE}`}
        style={styles.chevron}
      >
        <Path
          d={PLAN_LIST_ITEM_LAYOUT.CHEVRON_PATH}
          fill="none"
          stroke={theme.colors.title}
          strokeWidth={PLAN_LIST_ITEM_LAYOUT.CHEVRON_STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      {hasSeparator ? <View pointerEvents="none" style={styles.separator} /> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const layout = PLAN_DAY_ROW_LAYOUT

  return {
    row: {
      height: layout.HEIGHT * scale,
      justifyContent: 'center',
    },
    circle: {
      position: 'absolute',
      left: layout.CIRCLE_LEFT * scale,
      top: ((layout.HEIGHT - layout.CIRCLE_SIZE) / 2) * scale,
      width: layout.CIRCLE_SIZE * scale,
      height: layout.CIRCLE_SIZE * scale,
      borderRadius: (layout.CIRCLE_SIZE / 2) * scale,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.planDayCircle,
    },
    number: {
      fontSize: layout.NUMBER_FONT_SIZE * scale,
      color: theme.colors.planAccent,
    },
    texts: {
      marginLeft: layout.TEXT_LEFT * scale,
      marginRight: (layout.CHEVRON_CENTER_RIGHT + PLAN_LIST_ITEM_LAYOUT.CHEVRON_SIZE) * scale,
      marginTop: layout.TEXT_OFFSET_TOP * 2 * scale,
    },
    dayLabel: {
      fontSize: layout.TITLE_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    title: {
      fontSize: layout.SUBTITLE_FONT_SIZE * scale,
      color: theme.colors.body,
    },
    chevron: {
      position: 'absolute',
      right: (layout.CHEVRON_CENTER_RIGHT - PLAN_LIST_ITEM_LAYOUT.CHEVRON_SIZE / 2) * scale,
      top: ((layout.HEIGHT - PLAN_LIST_ITEM_LAYOUT.CHEVRON_SIZE) / 2) * scale,
    },
    separator: {
      position: 'absolute',
      left: layout.TEXT_LEFT * scale,
      right: layout.SEPARATOR_RIGHT * scale,
      bottom: 0,
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.tabBarSeparator,
    },
  }
})

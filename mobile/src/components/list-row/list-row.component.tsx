import { LIST_ROW_ICON_PATHS, type ListRowIconName, TEST_IDS } from '@clavis-via/shared'
import { Pressable, useWindowDimensions, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import type { ListRowInks, ListRowMetrics } from '../../@types/component.type'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { LIST_ROW_METRICS } from '../../constants/component.constant'
import { DESIGN } from '../../constants/design.constant'
import { scaleDesignValue } from '../../utils/design'
import { AppText } from '../app-text/app-text.component'

type ListRowProps = Readonly<{
  icon: ListRowIconName
  label: string
  onPress: () => void
  testID?: string
  // The line under the row; the last row of a list has none.
  hasDivider?: boolean
  isDisabled?: boolean
  // Measures of the row (design units) and the inks of its icon, label and arrow; the defaults are the menu of the Perfil.
  metrics?: ListRowMetrics
  inks?: ListRowInks
}>

// A menu row: icon, label, arrow and the divider that separates it from the next row.
export function ListRow({
  icon,
  label,
  onPress,
  testID,
  hasDivider = true,
  isDisabled = false,
  metrics = LIST_ROW_METRICS,
  inks,
}: ListRowProps) {
  const { theme } = useUnistyles()
  const { width } = useWindowDimensions()

  const iconSize = scaleDesignValue(metrics.ICON_SIZE, width)
  const chevronSize = scaleDesignValue(metrics.CHEVRON_SIZE, width)
  const rowHeight = scaleDesignValue(metrics.HEIGHT, width)
  const touchSlop = Math.max(0, (LIST_ROW_METRICS.MINIMUM_TOUCH_HEIGHT - rowHeight) / 2)

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      hitSlop={{ top: touchSlop, bottom: touchSlop }}
      onPress={onPress}
      style={styles.row(metrics)}
    >
      <Svg
        width={iconSize}
        height={iconSize}
        viewBox={`0 0 ${LIST_ROW_METRICS.ICON_VIEW_BOX_SIZE} ${LIST_ROW_METRICS.ICON_VIEW_BOX_SIZE}`}
        style={styles.icon(metrics)}
      >
        <Path
          d={LIST_ROW_ICON_PATHS[icon]}
          fill="none"
          stroke={inks?.icon ?? theme.colors.profileRowIcon}
          strokeWidth={LIST_ROW_METRICS.ICON_STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <AppText
        variant="bodyMedium"
        style={styles.label(metrics, inks?.label ?? theme.colors.title)}
      >
        {label}
      </AppText>
      <Svg
        width={chevronSize}
        height={chevronSize}
        viewBox={`0 0 ${LIST_ROW_METRICS.ICON_VIEW_BOX_SIZE} ${LIST_ROW_METRICS.ICON_VIEW_BOX_SIZE}`}
        style={styles.chevron(metrics)}
      >
        <Path
          d={LIST_ROW_METRICS.CHEVRON_PATH}
          fill="none"
          stroke={inks?.chevron ?? theme.colors.profileChevron}
          strokeWidth={LIST_ROW_METRICS.CHEVRON_STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      {hasDivider ? (
        <View
          testID={testID ? `${testID}${TEST_IDS.LIST_ROW_DIVIDER_SUFFIX}` : undefined}
          style={styles.divider(metrics)}
        />
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH

  return {
    row: (metrics: ListRowMetrics) => ({ height: metrics.HEIGHT * scale }),
    icon: (metrics: ListRowMetrics) => ({
      position: 'absolute',
      left: metrics.ICON_LEFT * scale,
      top: (metrics.HEIGHT * scale - metrics.ICON_SIZE * scale) / 2,
    }),
    // The label is placed by its baseline, like the other texts of the design.
    label: (metrics: ListRowMetrics, color: string) => ({
      position: 'absolute',
      left: metrics.LABEL_LEFT * scale,
      // A long label is cut before the arrow instead of running under it.
      right: (metrics.CHEVRON_RIGHT + metrics.CHEVRON_SIZE) * scale,
      top:
        (metrics.LABEL_BASELINE -
          AUTHENTICATION_FONT_METRICS.BODY_ASCENT * metrics.LABEL_FONT_SIZE) *
        scale,
      fontSize: metrics.LABEL_FONT_SIZE * scale,
      color,
    }),
    chevron: (metrics: ListRowMetrics) => ({
      position: 'absolute',
      right: metrics.CHEVRON_RIGHT * scale,
      top:
        (metrics.HEIGHT * scale - metrics.CHEVRON_SIZE * scale) / 2 +
        LIST_ROW_METRICS.CHEVRON_OFFSET_Y * scale,
    }),
    divider: (metrics: ListRowMetrics) => ({
      position: 'absolute',
      left: metrics.DIVIDER_LEFT * scale,
      right: metrics.DIVIDER_RIGHT * scale,
      bottom: 0,
      height: LIST_ROW_METRICS.DIVIDER_HEIGHT * scale,
      backgroundColor: theme.colors.profileDivider,
    }),
  }
})

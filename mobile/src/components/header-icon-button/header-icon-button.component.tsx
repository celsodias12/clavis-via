import { Pressable, useWindowDimensions } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import type { HeaderIconName } from '../../@types/component.type'
import { HEADER_ICON_METRICS, HEADER_ICON_STYLES } from '../../constants/component.constant'
import { scaleDesignValue } from '../../utils/design'

type HeaderIconButtonProps = Readonly<{
  icon: HeaderIconName
  onPress: () => void
  accessibilityLabel: string
}>

export function HeaderIconButton({ icon, onPress, accessibilityLabel }: HeaderIconButtonProps) {
  const { theme } = useUnistyles()
  const { width } = useWindowDimensions()

  const iconStyle = HEADER_ICON_STYLES[icon]
  const iconSize = scaleDesignValue(iconStyle.size, width)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.button}
    >
      <Svg
        width={iconSize}
        height={iconSize}
        viewBox={`0 0 ${HEADER_ICON_METRICS.VIEW_BOX_SIZE} ${HEADER_ICON_METRICS.VIEW_BOX_SIZE}`}
      >
        <Path
          d={iconStyle.path}
          fill="none"
          stroke={theme.colors.title}
          strokeWidth={iconStyle.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    minWidth: HEADER_ICON_METRICS.MINIMUM_TOUCH_SIZE,
    minHeight: HEADER_ICON_METRICS.MINIMUM_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

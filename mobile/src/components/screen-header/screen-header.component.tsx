import { TEST_IDS } from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import type { HeaderIconName, ScreenHeaderLayout } from '../../@types/component.type'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import {
  HEADER_ICON_LABEL_KEYS,
  HEADER_ICON_METRICS,
  HEADER_ICON_STYLES,
} from '../../constants/component.constant'
import { DESIGN } from '../../constants/design.constant'
import { SCREEN_HEADER_LAYOUT } from '../../constants/plan-day-layout.constant'
import { AppText } from '../app-text/app-text.component'
import { HeaderIconButton } from '../header-icon-button/header-icon-button.component'

type ScreenHeaderProps = Readonly<{
  title: string
  // The back arrow of the design is the chevron only; an icon is drawn only when its handler is given too.
  leftIcon?: 'back' | 'close'
  onLeftPress?: () => void
  rightIcon?: HeaderIconName
  onRightPress?: () => void
  // Where the parts sit; the Dia header is the default.
  layout?: ScreenHeaderLayout
}>

// Header with a back (or close) button on the left, the title centered and an optional icon on the right.
export function ScreenHeader({
  title,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  layout = SCREEN_HEADER_LAYOUT,
}: ScreenHeaderProps) {
  const { t } = useTranslation()

  const leftStyleIcon: HeaderIconName = leftIcon === 'close' ? 'close' : 'chevronBack'

  return (
    <View testID={TEST_IDS.SCREEN_HEADER} style={styles.container(layout)}>
      <AppText variant="titleMedium" accessibilityRole="header" style={styles.title(layout)}>
        {title}
      </AppText>
      {leftIcon !== undefined && onLeftPress !== undefined ? (
        <View style={styles.left(leftStyleIcon, layout)}>
          <HeaderIconButton
            icon={leftStyleIcon}
            onPress={onLeftPress}
            accessibilityLabel={t(HEADER_ICON_LABEL_KEYS[leftStyleIcon])}
          />
        </View>
      ) : null}
      {rightIcon !== undefined && onRightPress !== undefined ? (
        <View style={styles.right(rightIcon, layout)}>
          <HeaderIconButton
            icon={rightIcon}
            onPress={onRightPress}
            accessibilityLabel={t(HEADER_ICON_LABEL_KEYS[rightIcon])}
          />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const topOf = (designY: number) =>
    runtime.insets.top + (designY - DESIGN.STATUS_BAR_HEIGHT) * scale
  const iconHalf = (icon: HeaderIconName) =>
    Math.max(HEADER_ICON_METRICS.MINIMUM_TOUCH_SIZE, HEADER_ICON_STYLES[icon].size * scale) / 2

  return {
    container: (layout: ScreenHeaderLayout) => ({ height: topOf(layout.END_Y) }),
    // The title is centered between the card edges and placed by its baseline.
    title: (layout: ScreenHeaderLayout) => ({
      position: 'absolute',
      left: 0,
      right: 0,
      top: topOf(
        layout.TITLE_BASELINE - AUTHENTICATION_FONT_METRICS.TITLE_ASCENT * layout.TITLE_FONT_SIZE,
      ),
      textAlign: 'center',
      fontSize: layout.TITLE_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    }),
    left: (icon: HeaderIconName, layout: ScreenHeaderLayout) => ({
      position: 'absolute',
      left: layout.LEFT_CENTER_X * scale - iconHalf(icon),
      top: topOf(layout.LEFT_CENTER_Y) - iconHalf(icon),
    }),
    right: (icon: HeaderIconName, layout: ScreenHeaderLayout) => ({
      position: 'absolute',
      right: layout.RIGHT_CENTER_RIGHT * scale - iconHalf(icon),
      top: topOf(layout.RIGHT_CENTER_Y) - iconHalf(icon),
    }),
  }
})

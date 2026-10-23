import { TAB_ICON_PATHS, TAB_ITEMS, type TabIconName, TEST_IDS } from '@clavis-via/shared'
import type { BottomTabBarProps } from 'expo-router/js-tabs'
import { useTranslation } from 'react-i18next'
import { Pressable, useWindowDimensions, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { DESIGN } from '../../constants/design.constant'
import { TAB_BAR_LAYOUT, TAB_ICON_METRICS } from '../../constants/tab-bar.constant'
import { WELCOME_FONT_METRICS } from '../../constants/welcome.constant'
import { AppText } from '../app-text/app-text.component'

type TabIconProps = Readonly<{ icon: TabIconName; selected: boolean }>

function TabIcon({ icon, selected }: TabIconProps) {
  const { theme } = useUnistyles()
  const { width } = useWindowDimensions()
  const size = (TAB_BAR_LAYOUT.ICON_SIZE * width) / DESIGN.CARD_WIDTH
  const paths = TAB_ICON_PATHS[icon]

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${TAB_ICON_METRICS.VIEW_BOX_SIZE} ${TAB_ICON_METRICS.VIEW_BOX_SIZE}`}
    >
      {selected ? (
        <Path
          d={paths.filledBody}
          fill={theme.colors.tabBarActive}
          stroke={theme.colors.tabBarActive}
          strokeWidth={TAB_ICON_METRICS.FILLED_STROKE_WIDTH}
          strokeLinejoin="round"
        />
      ) : (
        <Path
          d={paths.outlineBody}
          fill="none"
          stroke={theme.colors.tabBarInactiveIcon}
          strokeWidth={TAB_ICON_METRICS.STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {paths.detail ? (
        <Path
          d={paths.detail}
          fill="none"
          stroke={selected ? theme.colors.white : theme.colors.tabBarInactiveIcon}
          strokeWidth={TAB_ICON_METRICS.DETAIL_STROKE_WIDTH}
          strokeLinecap="round"
        />
      ) : null}
    </Svg>
  )
}

// Custom bottom bar of the (tabs) group. It is pinned to the screen bottom over the scenes (they keep
// positioning from the real screen bottom) and every screen reserves its own space above it.
export function TabBar({ state, emitter, navigateToTab }: Readonly<BottomTabBarProps>) {
  const { t } = useTranslation()

  return (
    <View testID={TEST_IDS.TAB_BAR} role="tablist" style={styles.bar}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const item = TAB_ITEMS.find((candidate) => candidate.routeName === route.name)
          const selected = state.index === index
          if (!item) {
            return null
          }

          const handlePress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })
            if (!selected && !event.defaultPrevented) {
              navigateToTab(route.key)
            }
          }

          return (
            <Pressable
              key={route.key}
              testID={`${TEST_IDS.TAB_BAR_ITEM_PREFIX}${item.routeName}`}
              accessibilityRole="tab"
              accessibilityLabel={t(item.labelKey)}
              accessibilityState={{ selected }}
              hitSlop={TAB_BAR_LAYOUT.ITEM_HIT_SLOP}
              onPress={handlePress}
              style={styles.item}
            >
              <TabIcon icon={item.icon} selected={selected} />
              <AppText variant={selected ? 'bodySemiBold' : 'body'} style={styles.label(selected)}>
                {t(item.labelKey)}
              </AppText>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

// Design units become dp with s = screen width / 266. The bar is anchored to the bottom inset; the items
// inside it are placed from its top edge.
const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const fontSize = TAB_BAR_LAYOUT.LABEL_FONT_SIZE
  const labelTop = TAB_BAR_LAYOUT.LABEL_BASELINE - WELCOME_FONT_METRICS.BODY_ASCENT * fontSize
  const iconBottom = TAB_BAR_LAYOUT.ICON_TOP + TAB_BAR_LAYOUT.ICON_SIZE

  return {
    bar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: runtime.insets.bottom + TAB_BAR_LAYOUT.BAR_HEIGHT * scale,
      backgroundColor: theme.colors.tabBarBackground,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.tabBarSeparator,
    },
    row: {
      position: 'absolute',
      left: TAB_BAR_LAYOUT.PADDING_LEFT * scale,
      right: TAB_BAR_LAYOUT.PADDING_RIGHT * scale,
      top: (TAB_BAR_LAYOUT.ICON_TOP - TAB_BAR_LAYOUT.BAR_TOP) * scale,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    item: { alignItems: 'center' },
    label: (selected: boolean) => ({
      marginTop: (labelTop - iconBottom) * scale,
      fontSize: fontSize * scale,
      color: selected ? theme.colors.tabBarActive : theme.colors.tabBarInactiveLabel,
    }),
  }
})

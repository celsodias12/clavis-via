import {
  CHECK_IN_OPTION_BY_STATE,
  type CheckInState,
  EMOTION_ICON_METRICS,
  TEST_IDS,
} from '@clavis-via/shared'
import { Pressable, useWindowDimensions, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { CHECK_IN_TILE_METRICS } from '../../constants/check-in-layout.constant'
import { scaleDesignValue } from '../../utils/design'
import { AppText } from '../app-text/app-text.component'
import { EmotionIcon } from '../emotion-icon/emotion-icon.component'

type CheckInOptionProps = Readonly<{
  state: CheckInState
  label: string
  isSelected: boolean
  onPress: () => void
}>

// A pastel tile with the face of an emotion and its label. It fills the width its parent gives it.
export function CheckInOption({ state, label, isSelected, onPress }: CheckInOptionProps) {
  const { width } = useWindowDimensions()

  const { tileColor } = CHECK_IN_OPTION_BY_STATE[state]

  return (
    <Pressable
      testID={`${TEST_IDS.CHECK_IN_OPTION_PREFIX}${state}`}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={styles.tile(tileColor, width)}
    >
      <View style={styles.icon(width)}>
        <EmotionIcon
          state={state}
          size={scaleDesignValue(EMOTION_ICON_METRICS.VIEW_BOX_SIZE, width)}
        />
      </View>
      <AppText variant="body" numberOfLines={1} style={styles.label(width)}>
        {label}
      </AppText>
      {isSelected ? (
        <View
          testID={TEST_IDS.CHECK_IN_OPTION_BORDER}
          pointerEvents="none"
          style={styles.border(width)}
        />
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  tile: (tileColor: string, width: number) => ({
    height: scaleDesignValue(CHECK_IN_TILE_METRICS.HEIGHT, width),
    borderRadius: scaleDesignValue(CHECK_IN_TILE_METRICS.RADIUS, width),
    backgroundColor: tileColor,
  }),
  // The icon box is as wide as the tile and centers the face horizontally.
  icon: (width: number) => ({
    position: 'absolute',
    top: scaleDesignValue(CHECK_IN_TILE_METRICS.ICON_TOP, width),
    left: 0,
    right: 0,
    alignItems: 'center',
  }),
  label: (width: number) => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: scaleDesignValue(
      CHECK_IN_TILE_METRICS.LABEL_BASELINE -
        AUTHENTICATION_FONT_METRICS.BODY_ASCENT * CHECK_IN_TILE_METRICS.LABEL_FONT_SIZE,
      width,
    ),
    textAlign: 'center',
    fontSize: scaleDesignValue(CHECK_IN_TILE_METRICS.LABEL_FONT_SIZE, width),
    color: theme.colors.title,
  }),
  border: (width: number) => ({
    ...StyleSheet.absoluteFillObject,
    borderRadius: scaleDesignValue(CHECK_IN_TILE_METRICS.RADIUS, width),
    borderWidth: scaleDesignValue(CHECK_IN_TILE_METRICS.SELECTED_BORDER_WIDTH, width),
    borderColor: theme.colors.tileSelectedBorder,
  }),
}))

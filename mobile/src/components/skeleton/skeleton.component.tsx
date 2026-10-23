import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'
import { SKELETON_METRICS } from '../../constants/component.constant'
import { scaleDesignValue } from '../../utils/design'

type SkeletonProps = Readonly<{
  // Width in design units; the block fills its container when omitted.
  width?: number
  height: number
  radius?: number
}>

// Pulsing placeholder that mirrors the real layout while content loads.
export function Skeleton({
  width,
  height,
  radius = SKELETON_METRICS.DEFAULT_RADIUS,
}: SkeletonProps) {
  const { t } = useTranslation()
  const { width: screenWidth } = useWindowDimensions()

  const opacity = useSharedValue<number>(SKELETON_METRICS.PULSE_MAXIMUM_OPACITY)
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }))

  useEffect(() => {
    opacity.set(
      withRepeat(
        withTiming(SKELETON_METRICS.PULSE_MINIMUM_OPACITY, {
          duration: SKELETON_METRICS.PULSE_DURATION_MS,
        }),
        -1,
        true,
      ),
    )
  }, [opacity])

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel={t('common.loading')}
      style={[styles.block(screenWidth, height, radius, width), animatedStyle]}
    />
  )
}

const styles = StyleSheet.create((theme) => ({
  block: (screenWidth: number, height: number, radius: number, width?: number) => ({
    width: width === undefined ? '100%' : scaleDesignValue(width, screenWidth),
    height: scaleDesignValue(height, screenWidth),
    borderRadius: scaleDesignValue(radius, screenWidth),
    backgroundColor: theme.colors.fieldBorder,
  }),
}))

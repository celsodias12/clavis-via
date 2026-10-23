import { TEST_IDS } from '@clavis-via/shared'
import { Image, useWindowDimensions, View } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import {
  WAVE_BACKGROUND_ASPECT,
  WAVE_FADE_GRADIENT_ID,
  WAVE_SEAM_FADE_HEIGHT,
} from '../../constants/component.constant'

// Density variants (welcome-background.png and @3x) are picked by React Native.
const waveSource = require('../../../assets/images/welcome-background.png')

// The image has the width of the screen and keeps its 266 x 560 proportion, pinned to the bottom.
// The area above it is filled with the measured top color so the image never needs cropping or stretching.
export function WaveBackground() {
  const { theme } = useUnistyles()
  const { width } = useWindowDimensions()

  const fadeHeight = (width * WAVE_SEAM_FADE_HEIGHT) / WAVE_BACKGROUND_ASPECT.WIDTH
  const imageHeight = (width * WAVE_BACKGROUND_ASPECT.HEIGHT) / WAVE_BACKGROUND_ASPECT.WIDTH

  return (
    <View
      testID={TEST_IDS.WAVE_BACKGROUND}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={styles.container}
    >
      <View testID={TEST_IDS.WAVE_BACKGROUND_TOP} style={styles.top(imageHeight)} />
      <Image
        testID={TEST_IDS.WAVE_BACKGROUND_IMAGE}
        source={waveSource}
        resizeMode="stretch"
        style={styles.image(width, imageHeight)}
      />
      {/* Fades the flat top color into the image so no horizontal edge shows where they meet. */}
      <Svg
        testID={TEST_IDS.WAVE_BACKGROUND_FADE}
        width={width}
        height={fadeHeight}
        style={styles.fade(imageHeight, fadeHeight)}
      >
        <Defs>
          <LinearGradient id={WAVE_FADE_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.colors.waveTop} stopOpacity={1} />
            <Stop offset="1" stopColor={theme.colors.waveTop} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={width}
          height={fadeHeight}
          fill={`url(#${WAVE_FADE_GRADIENT_ID})`}
        />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  top: (imageHeight: number) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: imageHeight,
    backgroundColor: theme.colors.waveTop,
  }),
  fade: (imageHeight: number, fadeHeight: number) => ({
    position: 'absolute',
    left: 0,
    bottom: imageHeight - fadeHeight,
  }),
  image: (width: number, imageHeight: number) => ({
    position: 'absolute',
    left: 0,
    bottom: 0,
    width,
    height: imageHeight,
  }),
}))

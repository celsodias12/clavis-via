import { BRAND_KEY_METRICS, BRAND_KEY_SHAPES, TEST_IDS } from '@clavis-via/shared'
import { useWindowDimensions } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { useUnistyles } from 'react-native-unistyles'
import { scaleDesignValue } from '../../utils/design'

type BrandKeyProps = Readonly<{
  // Width in design units.
  width: number
}>

const GRADIENT_FILL = `url(#${BRAND_KEY_METRICS.GRADIENT_ID})`

// The key from the approved mockup: three circles, a shaft and the bit.
export function BrandKey({ width }: BrandKeyProps) {
  const { theme } = useUnistyles()
  const { width: screenWidth } = useWindowDimensions()

  const scaledWidth = scaleDesignValue(width, screenWidth)
  const scaledHeight =
    (scaledWidth * BRAND_KEY_METRICS.VIEW_BOX_HEIGHT) / BRAND_KEY_METRICS.VIEW_BOX_WIDTH

  return (
    <Svg
      testID={TEST_IDS.BRAND_KEY}
      width={scaledWidth}
      height={scaledHeight}
      viewBox={`0 0 ${BRAND_KEY_METRICS.VIEW_BOX_WIDTH} ${BRAND_KEY_METRICS.VIEW_BOX_HEIGHT}`}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <Defs>
        <LinearGradient
          id={BRAND_KEY_METRICS.GRADIENT_ID}
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={BRAND_KEY_METRICS.GRADIENT_START_Y}
          x2={0}
          y2={BRAND_KEY_METRICS.GRADIENT_END_Y}
        >
          {theme.colors.keyGradient.map((stop) => (
            <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </LinearGradient>
      </Defs>
      {BRAND_KEY_SHAPES.CIRCLES.map((circle) => (
        <Circle
          key={circle.cx}
          cx={circle.cx}
          cy={circle.cy}
          r={circle.r}
          fill="none"
          stroke={GRADIENT_FILL}
          strokeWidth={BRAND_KEY_METRICS.CIRCLE_STROKE_WIDTH}
        />
      ))}
      <Rect
        x={BRAND_KEY_SHAPES.SHAFT.x}
        y={BRAND_KEY_SHAPES.SHAFT.y}
        width={BRAND_KEY_SHAPES.SHAFT.width}
        height={BRAND_KEY_SHAPES.SHAFT.height}
        rx={BRAND_KEY_SHAPES.SHAFT.rx}
        fill={GRADIENT_FILL}
      />
      <Path d={BRAND_KEY_SHAPES.BIT_PATH} fill={GRADIENT_FILL} />
    </Svg>
  )
}

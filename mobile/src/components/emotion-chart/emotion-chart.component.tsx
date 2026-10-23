import {
  EMOTION_PERIODS,
  EMOTION_SCORE_RANGE,
  type EmotionPeriod,
  type EmotionPoint,
  TEST_IDS,
  toEmotionChartPoints,
} from '@clavis-via/shared'
import { Canvas, Fill, LinearGradient, vec } from '@shopify/react-native-skia'
import { useWindowDimensions } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { Area, CartesianChart, Line, Scatter } from 'victory-native'
import { DESIGN } from '../../constants/design.constant'
import { EMOTIONS_LAYOUT } from '../../constants/emotions-layout.constant'
import { scaleDesignValue } from '../../utils/design'

type EmotionChartProps = Readonly<{
  points: readonly EmotionPoint[]
  period: EmotionPeriod
}>

const X_KEY = 'position'
const Y_KEY = 'score'
// victory-native draws grid lines and a frame by default; the design has none.
const NO_LINES = Object.freeze({ lineWidth: 0 })

// The line of the scores of a period: one point per column, a soft gradient under the line and a dot on every
// column that has a score. Columns without a score are left out and the line joins the ones that exist. No axes
// are drawn: the labels (and the emoji of the week) sit under the chart, drawn by the screen.
export function EmotionChart({ points, period }: EmotionChartProps) {
  const { theme } = useUnistyles()
  const { width } = useWindowDimensions()

  const data = toEmotionChartPoints(points)
  const cardWidth =
    width - scaleDesignValue(EMOTIONS_LAYOUT.CARD_LEFT + EMOTIONS_LAYOUT.CARD_RIGHT, width)
  // The columns fill the card, so the first and the last points sit half a column from its edges.
  const halfColumn = cardWidth / points.length / 2
  const pointRadius = scaleDesignValue(
    period === EMOTION_PERIODS.MONTH
      ? EMOTIONS_LAYOUT.MONTH_POINT_RADIUS
      : EMOTIONS_LAYOUT.POINT_RADIUS,
    width,
  )

  // An opaque canvas uses Android's compositor surface instead of TextureView readback, which can
  // leave the graph blank on software-rendered emulators. Headless Victory keeps the same plot geometry.
  return (
    <Canvas testID={TEST_IDS.EMOTION_CHART} style={styles.canvas} opaque>
      <Fill color={theme.colors.homeCardBackground} />
      <CartesianChart
        headless
        explicitSize={{
          width: cardWidth,
          height: scaleDesignValue(EMOTIONS_LAYOUT.CHART_HEIGHT, width),
        }}
        data={data}
        xKey={X_KEY}
        yKeys={[Y_KEY]}
        xAxis={NO_LINES}
        yAxis={[{ ...NO_LINES, yKeys: [Y_KEY] }]}
        frame={NO_LINES}
        domain={{ y: [EMOTION_SCORE_RANGE.MINIMUM, EMOTION_SCORE_RANGE.MAXIMUM] }}
        domainPadding={{
          left: halfColumn,
          right: halfColumn,
          top: scaleDesignValue(EMOTIONS_LAYOUT.CHART_PADDING_TOP, width),
          bottom: scaleDesignValue(EMOTIONS_LAYOUT.CHART_PADDING_BOTTOM, width),
        }}
      >
        {({ points: chartPoints, chartBounds }) => (
          <>
            <Area points={chartPoints.score} y0={chartBounds.bottom} connectMissingData>
              <LinearGradient
                start={vec(0, chartBounds.top)}
                end={vec(0, chartBounds.bottom)}
                colors={[theme.colors.emotionsAreaTop, theme.colors.emotionsAreaBottom]}
              />
            </Area>
            <Line
              points={chartPoints.score}
              color={theme.colors.emotionsChartLine}
              strokeWidth={scaleDesignValue(EMOTIONS_LAYOUT.LINE_WIDTH, width)}
              connectMissingData
            />
            <Scatter
              points={chartPoints.score.filter(
                (point) => point.y !== null && point.y !== undefined,
              )}
              radius={pointRadius}
              color={theme.colors.emotionsChartPoint}
            />
          </>
        )}
      </CartesianChart>
    </Canvas>
  )
}

const styles = StyleSheet.create((_theme, runtime) => ({
  canvas: {
    height: (EMOTIONS_LAYOUT.CHART_HEIGHT * runtime.screen.width) / DESIGN.CARD_WIDTH,
  },
}))

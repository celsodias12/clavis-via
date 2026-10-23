import {
  colors,
  EMOTION_PERIODS,
  EMOTION_SCORE_RANGE,
  type EmotionPeriod,
  type EmotionPoint,
  TEST_IDS,
  toEmotionChartPoints,
} from '@clavis-via/shared'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
// False positive: this whole component is loaded with React.lazy by the emotions screen, so recharts
// already travels in its own on-demand chunk and never reaches the initial bundle.
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import
import { Area, AreaChart, XAxis, YAxis } from 'recharts'
import { EMOTION_CHART_METRICS } from '../../constants/emotions.constant'
import { type ChartConfig, ChartContainer } from '../ui/chart'

type EmotionChartProps = Readonly<{
  points: readonly EmotionPoint[]
  period: EmotionPeriod
}>

const CHART_CONFIG = {
  [EMOTION_CHART_METRICS.SCORE_KEY]: { color: colors.emotionsChartLine },
} satisfies ChartConfig

const GRADIENT_END = 1

// The line of the scores of a period: one point per column, a soft gradient under the line and a dot on every
// column that has a score. Columns without a score are left out and the line joins the ones that exist. No axes
// are drawn: the labels (and the emoji of the week) sit under the chart, drawn by the screen. The columns fill
// the width, so the x axis runs from half a column before the first point to half a column after the last.
export function EmotionChart({ points, period }: EmotionChartProps) {
  const { t } = useTranslation()
  const gradientId = useId().replaceAll(':', '')

  const data = toEmotionChartPoints(points)
  const pointRadius =
    period === EMOTION_PERIODS.MONTH
      ? EMOTION_CHART_METRICS.MONTH_POINT_RADIUS
      : EMOTION_CHART_METRICS.POINT_RADIUS

  return (
    <div
      data-testid={TEST_IDS.EMOTION_CHART}
      role="img"
      aria-label={t('screen.emotions.chartLabel')}
      className="size-full"
    >
      <ChartContainer config={CHART_CONFIG} className="aspect-auto size-full">
        <AreaChart data={data} margin={EMOTION_CHART_METRICS.MARGIN} accessibilityLayer={false}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2={GRADIENT_END}>
              <stop offset="0" stopColor={colors.emotionsAreaTop} />
              <stop offset={GRADIENT_END} stopColor={colors.emotionsAreaBottom} />
            </linearGradient>
          </defs>
          <XAxis
            hide
            type="number"
            dataKey={EMOTION_CHART_METRICS.POSITION_KEY}
            domain={[
              -EMOTION_CHART_METRICS.HALF_COLUMN,
              data.length - EMOTION_CHART_METRICS.HALF_COLUMN,
            ]}
          />
          <YAxis hide domain={[EMOTION_SCORE_RANGE.MINIMUM, EMOTION_SCORE_RANGE.MAXIMUM]} />
          <Area
            type="linear"
            dataKey={EMOTION_CHART_METRICS.SCORE_KEY}
            connectNulls
            isAnimationActive={false}
            stroke={colors.emotionsChartLine}
            strokeWidth={EMOTION_CHART_METRICS.LINE_WIDTH}
            fill={`url(#${gradientId})`}
            dot={{ r: pointRadius, fill: colors.emotionsChartPoint, stroke: 'none' }}
            activeDot={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

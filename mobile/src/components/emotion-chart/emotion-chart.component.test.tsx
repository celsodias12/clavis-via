import type { EmotionPoint } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { EmotionChart } from './emotion-chart.component'

// victory-native and Skia draw on a native canvas that does not exist under Jest: the doubles record what the
// chart asks them to draw and run the render prop with fake chart points.
const mockCalls: {
  chart: Record<string, unknown>
  area: Record<string, unknown>[]
  line: Record<string, unknown>[]
  scatter: Record<string, unknown>[]
} = { chart: {}, area: [], line: [], scatter: [] }

jest.mock('victory-native', () => {
  const { View } = require('react-native')
  return {
    CartesianChart: ({
      children,
      ...props
    }: {
      children: (arguments_: unknown) => ReactNode
      data: { position: number; score: number | null }[]
    }) => {
      mockCalls.chart = props
      const score = props.data.map((datum) => ({
        x: datum.position * 10,
        xValue: datum.position,
        y: datum.score === null ? null : 100 - datum.score * 10,
        yValue: datum.score,
      }))
      return (
        <View testID="mock-cartesian-chart">
          {children({ points: { score }, chartBounds: { top: 5, bottom: 95, left: 0, right: 60 } })}
        </View>
      )
    },
    Area: (props: Record<string, unknown> & { children?: ReactNode }) => {
      mockCalls.area.push(props)
      return <View>{props.children}</View>
    },
    Line: (props: Record<string, unknown>) => {
      mockCalls.line.push(props)
      return <View />
    },
    Scatter: (props: Record<string, unknown>) => {
      mockCalls.scatter.push(props)
      return <View />
    },
  }
})
jest.mock('@shopify/react-native-skia', () => {
  const { View } = require('react-native')
  return {
    Canvas: View,
    Fill: () => null,
    LinearGradient: () => null,
    vec: (x: number, y: number) => ({ x, y }),
  }
})

const POINTS: EmotionPoint[] = [
  { key: '2026-10-19', score: 2, state: 'anxious' },
  { key: '2026-10-20', score: null, state: 'other' },
  { key: '2026-10-21', score: 5, state: 'at-peace' },
  { key: '2026-10-22', score: null, state: null },
]

describe('EmotionChart', () => {
  beforeEach(() => {
    mockCalls.chart = {}
    mockCalls.area = []
    mockCalls.line = []
    mockCalls.scatter = []
  })

  it('plots one score per column on a domain from 1 to 5', async () => {
    await render(<EmotionChart points={POINTS} period="week" />)
    expect(screen.getByTestId('emotion-chart')).toBeTruthy()
    expect(mockCalls.chart).toEqual(
      expect.objectContaining({
        xKey: 'position',
        yKeys: ['score'],
        domain: { y: [1, 5] },
        data: [
          { position: 0, score: 2 },
          { position: 1, score: null },
          { position: 2, score: 5 },
          { position: 3, score: null },
        ],
      }),
    )
  })

  it('does not draw the points without a score and links only the ones that exist', async () => {
    await render(<EmotionChart points={POINTS} period="week" />)
    expect(mockCalls.scatter).toHaveLength(1)
    const drawn = mockCalls.scatter[0].points as { yValue: number | null }[]
    expect(drawn.map((point) => point.yValue)).toEqual([2, 5])
    expect(mockCalls.line[0]).toEqual(expect.objectContaining({ connectMissingData: true }))
    expect(mockCalls.area[0]).toEqual(expect.objectContaining({ connectMissingData: true, y0: 95 }))
  })

  it('draws nothing when no point has a score', async () => {
    await render(
      <EmotionChart points={[{ key: '2026-10-19', score: null, state: null }]} period="week" />,
    )
    expect(mockCalls.scatter[0].points as unknown[]).toHaveLength(0)
  })

  it('uses smaller dots in the month view, which has the most points', async () => {
    await render(<EmotionChart points={POINTS} period="week" />)
    await render(<EmotionChart points={POINTS} period="month" />)
    const [weekRadius, monthRadius] = mockCalls.scatter.map((call) => call.radius as number)
    expect(monthRadius).toBeLessThan(weekRadius)
  })
})

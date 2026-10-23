import type { EmotionPoint } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { EmotionChart } from './emotion-chart.component'

// Recharts measures its container, which jsdom cannot: the doubles record what the chart asks them to draw.
const mockCalls: {
  chart: Record<string, unknown>
  area: Record<string, unknown>[]
  xAxis: Record<string, unknown>[]
  yAxis: Record<string, unknown>[]
} = { chart: {}, area: [], xAxis: [], yAxis: [] }

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Tooltip: () => null,
  Legend: () => null,
  AreaChart: ({ children, ...props }: { children: ReactNode }) => {
    mockCalls.chart = props
    return <div data-testid="mock-area-chart">{children}</div>
  },
  Area: (props: Record<string, unknown>) => {
    mockCalls.area.push(props)
    return null
  },
  XAxis: (props: Record<string, unknown>) => {
    mockCalls.xAxis.push(props)
    return null
  },
  YAxis: (props: Record<string, unknown>) => {
    mockCalls.yAxis.push(props)
    return null
  },
}))

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
    mockCalls.xAxis = []
    mockCalls.yAxis = []
  })

  it('plots one score per column on a domain from 1 to 5', () => {
    render(<EmotionChart points={POINTS} period="week" />)

    expect(screen.getByRole('img', { name: 'Gráfico das suas emoções' })).toBeTruthy()
    expect(screen.getByTestId('emotion-chart')).toBeTruthy()
    expect(mockCalls.chart).toEqual(
      expect.objectContaining({
        data: [
          { position: 0, score: 2 },
          { position: 1, score: null },
          { position: 2, score: 5 },
          { position: 3, score: null },
        ],
      }),
    )
    expect(mockCalls.yAxis[0]).toEqual(expect.objectContaining({ domain: [1, 5], hide: true }))
  })

  it('puts every point at the center of its column', () => {
    render(<EmotionChart points={POINTS} period="week" />)

    expect(mockCalls.xAxis[0]).toEqual(
      expect.objectContaining({ dataKey: 'position', domain: [-0.5, 3.5], type: 'number' }),
    )
  })

  it('links the points that have a score and leaves out the ones that do not', () => {
    render(<EmotionChart points={POINTS} period="week" />)

    expect(mockCalls.area[0]).toEqual(
      expect.objectContaining({ dataKey: 'score', connectNulls: true, type: 'linear' }),
    )
  })

  it('draws nothing but the frame when no point has a score', () => {
    render(
      <EmotionChart points={[{ key: '2026-10-19', score: null, state: null }]} period="week" />,
    )

    expect(mockCalls.chart).toEqual(
      expect.objectContaining({ data: [{ position: 0, score: null }] }),
    )
  })

  it('uses smaller dots in the month view, which has the most points', () => {
    render(<EmotionChart points={POINTS} period="week" />)
    render(<EmotionChart points={POINTS} period="month" />)

    const [weekRadius, monthRadius] = mockCalls.area.map((call) => (call.dot as { r: number }).r)
    expect(monthRadius).toBeLessThan(weekRadius)
  })
})

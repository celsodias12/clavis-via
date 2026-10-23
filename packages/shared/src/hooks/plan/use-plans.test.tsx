import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { mockQuery } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { usePlans } from './use-plans'

const PLANS = [
  {
    id: 'when-discouragement-weighs',
    title: 'Quando o desânimo pesar',
    category: 'emotions',
    totalDays: 3,
  },
  { id: 'after-a-rejection', title: 'Depois de uma rejeição', category: 'emotions', totalDays: 7 },
]

function Probe() {
  const { data, isPending } = usePlans()
  if (isPending) {
    return <span>pending</span>
  }
  return <span>{data?.map((plan) => plan.title).join(' | ')}</span>
}

describe('usePlans', () => {
  it('lists the plans in the order the API sends them', async () => {
    server.use(mockQuery('plan.list', () => PLANS))
    renderWithProviders(<Probe />)
    await waitFor(() =>
      expect(screen.getByText('Quando o desânimo pesar | Depois de uma rejeição')).toBeTruthy(),
    )
  })
})

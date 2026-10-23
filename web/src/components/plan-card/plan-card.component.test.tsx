import { TEST_IDS } from '@clavis-via/shared'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { PlanCard } from './plan-card.component'

const PLAN = {
  id: 'when-discouragement-weighs',
  title: 'Quando o desânimo pesar',
  category: 'emotions',
  totalDays: 3,
} as const

function renderCard(plan: Parameters<typeof PlanCard>[0]['plan'] = PLAN) {
  return renderWithProviders(
    <PlanCard plan={plan} linkProps={{ to: ROUTES.PLAN, params: { planId: plan.id } }} />,
  )
}

describe('PlanCard', () => {
  it('shows the title and the duration with its plural', async () => {
    await renderCard()

    expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy()
    expect(screen.getByText('3 dias')).toBeTruthy()
  })

  it('uses the singular for one day', async () => {
    await renderCard({ ...PLAN, totalDays: 1 })

    expect(screen.getByText('1 dia')).toBeTruthy()
  })

  it('is one real link with the plan test ID that points at the plan', async () => {
    await renderCard()

    const card = screen.getByTestId(`${TEST_IDS.PLANS_ITEM_PREFIX}when-discouragement-weighs`)

    expect(card.tagName).toBe('A')
    expect(card.getAttribute('href')).toBe('/plan/when-discouragement-weighs')
  })

  it('serves the thumbnail of the plan, with its @3x file as a candidate', async () => {
    const { container } = await renderCard()

    const photo = container.querySelector('img')
    expect(photo?.getAttribute('src')).toBe('/images/plan-thumbnail-when-discouragement-weighs.png')
    expect(photo?.getAttribute('srcset')).toContain(
      '/images/plan-thumbnail-when-discouragement-weighs@3x.png 296w',
    )
    expect(photo?.getAttribute('alt')).toBe('')
  })

  it('switches to the cover photo from 768 px, with its @3x file as a candidate', async () => {
    const { container } = await renderCard()

    const source = container.querySelector('source')
    expect(source?.getAttribute('media')).toBe('(min-width: 768px)')
    expect(source?.getAttribute('srcset')).toBe(
      '/images/plan-cover-when-discouragement-weighs.png 219w, /images/plan-cover-when-discouragement-weighs@3x.png 876w',
    )
  })

  it('renders a plan without images of its own', async () => {
    await renderCard({ ...PLAN, id: 'unknown-plan' })

    expect(screen.getByTestId(`${TEST_IDS.PLANS_ITEM_PREFIX}unknown-plan`)).toBeTruthy()
  })
})

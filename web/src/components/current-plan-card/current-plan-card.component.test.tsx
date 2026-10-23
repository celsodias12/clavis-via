import { TEST_IDS } from '@clavis-via/shared'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { CurrentPlanCard } from './current-plan-card.component'

const PLAN = {
  planId: 'when-discouragement-weighs',
  title: 'Quando o desânimo pesar',
  totalDays: 3,
  completedDays: 1,
  nextDayNumber: 2,
}

describe('CurrentPlanCard', () => {
  it('shows the plan with its next day and progress, as a link to the plan', async () => {
    await renderWithProviders(
      <CurrentPlanCard
        plan={PLAN}
        linkProps={{ to: ROUTES.PLAN, params: { planId: PLAN.planId } }}
      />,
    )

    expect(screen.getByText('Continue sua jornada')).toBeTruthy()
    expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy()
    expect(screen.getByText('Dia 2 de 3')).toBeTruthy()
    expect(
      screen.getByRole('progressbar', { name: 'Progresso do plano' }).getAttribute('aria-valuenow'),
    ).toBe('33')

    expect(screen.getByTestId(TEST_IDS.HOME_CURRENT_PLAN).getAttribute('href')).toBe(
      '/plan/when-discouragement-weighs',
    )
  })

  it('invites to pick a plan, with no progress, when there is none', async () => {
    await renderWithProviders(<CurrentPlanCard plan={null} linkProps={{ to: ROUTES.PLANS }} />)

    expect(screen.getByText('Escolha um plano para começar.')).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.PROGRESS_BAR)).toBeNull()
  })
})

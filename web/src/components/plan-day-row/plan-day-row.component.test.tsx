import { cleanup, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { PlanDayRow } from './plan-day-row.component'

type RowProps = Omit<Parameters<typeof PlanDayRow>[0], 'linkProps'>

function renderRow(props: RowProps) {
  return renderWithProviders(
    <PlanDayRow
      {...props}
      linkProps={{
        to: ROUTES.PLAN_DAY,
        params: { planId: 'plan-x', dayNumber: String(props.dayNumber) },
      }}
    />,
  )
}

describe('PlanDayRow', () => {
  it('shows the number in the circle, "Dia N" and the title of an open day', async () => {
    await renderRow({ dayNumber: 2, title: 'Pequenos movimentos', isCompleted: false })

    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('Dia 2')).toBeTruthy()
    expect(screen.getByText('Pequenos movimentos')).toBeTruthy()
    expect(screen.queryByTestId('plan-day-row-2-completed')).toBeNull()
    expect(screen.getByRole('link', { name: 'Dia 2. Pequenos movimentos' })).toBeTruthy()
  })

  it('swaps the number for a completed mark once the day is done', async () => {
    await renderRow({ dayNumber: 1, title: 'Respirar e reconhecer', isCompleted: true })

    expect(screen.getByTestId('plan-day-row-1-completed')).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Dia 1. Respirar e reconhecer. Dia concluído' }),
    ).toBeTruthy()
    expect(screen.queryByText('1')).toBeNull()
  })

  it('is a real link to the day and draws a separator only when asked', async () => {
    const row = { dayNumber: 3, title: 'Voltar a acreditar', isCompleted: false }
    const { container } = await renderRow(row)
    const withoutSeparator = container.querySelectorAll('span').length

    expect(screen.getByTestId('plan-day-row-3').getAttribute('href')).toBe('/plan/plan-x/day/3')

    cleanup()
    const withSeparator = await renderRow({ ...row, hasSeparator: true })

    expect(withSeparator.container.querySelectorAll('span')).toHaveLength(withoutSeparator + 1)
  })
})

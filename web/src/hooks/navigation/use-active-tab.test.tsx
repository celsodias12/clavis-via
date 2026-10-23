import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES, TAB_ROUTES } from '../../constants/route.constant'
import { useActiveTab } from './use-active-tab'

function Probe() {
  return <p data-testid="tab">{useActiveTab() ?? 'none'}</p>
}

describe('useActiveTab', () => {
  it.each(Object.entries(TAB_ROUTES))('names the %s tab on its route', async (name, route) => {
    await renderWithProviders(<Probe />, { route })

    expect(screen.getByTestId('tab').textContent).toBe(name)
  })

  it('is undefined on a screen that is not a tab', async () => {
    await renderWithProviders(<Probe />, { route: ROUTES.PROFILE })

    expect(screen.getByTestId('tab').textContent).toBe('none')
  })
})

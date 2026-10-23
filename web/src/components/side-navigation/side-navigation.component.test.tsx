import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { clerkMock } from '../../../tests/utils/clerk-mock'
import { renderWithProviders } from '../../../tests/utils/render'
import { SideNavigation } from './side-navigation.component'

describe('SideNavigation', () => {
  it('shows the brand and the labeled items, marking the open tab', async () => {
    await renderWithProviders(<SideNavigation />, { route: '/plans' })

    expect(screen.getByText('CLAVIS VIA')).toBeTruthy()
    expect(screen.getByText('Início')).toBeTruthy()
    const plans = screen.getByTestId(`${TEST_IDS.TAB_BAR_ITEM_PREFIX}plans`)
    expect(plans.className).toContain('font-semibold')
    expect(screen.getByTestId(`${TEST_IDS.TAB_BAR_ITEM_PREFIX}home`).className).not.toContain(
      'font-semibold',
    )
  })

  it('navigates to the tab that is clicked', async () => {
    const { router } = await renderWithProviders(<SideNavigation />, { route: '/home' })

    fireEvent.click(screen.getByTestId(`${TEST_IDS.TAB_BAR_ITEM_PREFIX}journey`))

    await waitFor(() => expect(router.state.location.pathname).toBe('/journey'))
  })

  it('has a profile link whose accessible name holds the visible name', async () => {
    clerkMock.user = { firstName: 'Ana', hasImage: false, imageUrl: '' }
    await renderWithProviders(<SideNavigation />)

    const link = screen.getByRole('link', { name: /Ana/ })

    expect(link.getAttribute('href')).toBe('/profile')
    expect(link.textContent).toContain('Ana')
    expect(link.getAttribute('aria-label')).toBeNull()
  })
})

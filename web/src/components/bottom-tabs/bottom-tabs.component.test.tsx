import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { BottomTabs } from './bottom-tabs.component'

describe('BottomTabs', () => {
  it('shows the four labeled tabs and marks the open one', async () => {
    await renderWithProviders(<BottomTabs />, { route: '/conversation' })

    for (const label of ['Início', 'Planos', 'Conversa', 'Jornada']) {
      expect(screen.getByText(label)).toBeTruthy()
    }
    expect(screen.getByText('Conversa').className).toContain('font-semibold')
    expect(screen.getByText('Início').className).not.toContain('font-semibold')
  })

  it('navigates to the tab that is clicked', async () => {
    const { router } = await renderWithProviders(<BottomTabs />, { route: '/home' })

    fireEvent.click(screen.getByTestId(`${TEST_IDS.TAB_BAR_ITEM_PREFIX}plans`))

    await waitFor(() => expect(router.state.location.pathname).toBe('/plans'))
  })
})

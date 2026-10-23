import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { useStartNavigation } from './use-start-navigation'

function StartButton() {
  const goToStart = useStartNavigation()

  return (
    <button type="button" onClick={goToStart}>
      start
    </button>
  )
}

describe('useStartNavigation', () => {
  it('replaces the current entry with the start route', async () => {
    const { router } = await renderWithProviders(<StartButton />)
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(undefined)

    fireEvent.click(screen.getByText('start'))

    expect(navigate).toHaveBeenCalledWith({ to: ROUTES.START, replace: true })
  })
})

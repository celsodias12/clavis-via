import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { useGoBack } from './use-go-back'

function BackButton({ fallback }: Readonly<{ fallback: () => unknown }>) {
  const goBack = useGoBack(fallback)

  return (
    <button type="button" onClick={goBack}>
      back
    </button>
  )
}

describe('useGoBack', () => {
  it('goes back in the history when there is a previous page', async () => {
    const fallback = vi.fn()
    const { router } = await renderWithProviders(<BackButton fallback={fallback} />)
    const back = vi.spyOn(router.history, 'back').mockImplementation(() => {})
    vi.spyOn(router.history, 'canGoBack').mockReturnValue(true)

    fireEvent.click(screen.getByText('back'))

    expect(back).toHaveBeenCalledTimes(1)
    expect(fallback).not.toHaveBeenCalled()
  })

  it('runs the fallback on a direct visit', async () => {
    const fallback = vi.fn()
    const { router } = await renderWithProviders(<BackButton fallback={fallback} />)
    const back = vi.spyOn(router.history, 'back').mockImplementation(() => {})
    vi.spyOn(router.history, 'canGoBack').mockReturnValue(false)

    fireEvent.click(screen.getByText('back'))

    expect(fallback).toHaveBeenCalledTimes(1)
    expect(back).not.toHaveBeenCalled()
  })
})

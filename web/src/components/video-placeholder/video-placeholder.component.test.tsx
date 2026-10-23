import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { VideoPlaceholder } from './video-placeholder.component'

describe('VideoPlaceholder', () => {
  it('shows the length as a clock and reports the play click', () => {
    const onPlay = vi.fn()
    render(<VideoPlaceholder durationSeconds={138} onPlay={onPlay} />)

    expect(screen.getByText('2:18 min')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.VIDEO_PLACEHOLDER)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir vídeo' }))
    expect(onPlay).toHaveBeenCalledTimes(1)
  })

  it('serves the cover in both resolutions', () => {
    const { container } = render(<VideoPlaceholder durationSeconds={60} onPlay={vi.fn()} />)

    const cover = container.querySelector('img')
    expect(cover?.getAttribute('src')).toBe('/images/day-video-cover.png')
    expect(cover?.getAttribute('srcset')).toBe(
      '/images/day-video-cover.png 210w, /images/day-video-cover@3x.png 840w',
    )
  })
})

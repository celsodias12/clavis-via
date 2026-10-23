import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { VideoPlaceholder } from './video-placeholder.component'

describe('VideoPlaceholder', () => {
  it('shows the length as a clock and reports the play press', async () => {
    const onPlay = jest.fn()
    await render(<VideoPlaceholder durationSeconds={138} onPlay={onPlay} />)
    expect(screen.getByText('2:18 min')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.VIDEO_PLACEHOLDER)).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Reproduzir vídeo' }))
    expect(onPlay).toHaveBeenCalledTimes(1)
  })
})

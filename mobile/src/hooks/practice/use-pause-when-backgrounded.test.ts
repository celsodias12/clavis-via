import { act, renderHook } from '@testing-library/react-native'
import { AppState, type AppStateStatus } from 'react-native'
import { usePauseWhenBackgrounded } from './use-pause-when-backgrounded'

describe('usePauseWhenBackgrounded', () => {
  const remove = jest.fn()
  let emitAppState: (status: AppStateStatus) => void

  beforeEach(() => {
    remove.mockClear()
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
      emitAppState = listener as (status: AppStateStatus) => void
      return { remove }
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('pauses when the app goes to the background and not when it comes back', async () => {
    const pause = jest.fn()
    await renderHook(() => usePauseWhenBackgrounded(pause))

    await act(async () => emitAppState('background'))
    expect(pause).toHaveBeenCalledTimes(1)

    await act(async () => emitAppState('active'))
    expect(pause).toHaveBeenCalledTimes(1)
  })

  it('stops listening when unmounted', async () => {
    const { unmount } = await renderHook(() => usePauseWhenBackgrounded(jest.fn()))

    await unmount()

    expect(remove).toHaveBeenCalledTimes(1)
  })
})

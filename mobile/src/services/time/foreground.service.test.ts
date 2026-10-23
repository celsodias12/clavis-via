import { AppState, type AppStateStatus } from 'react-native'
import { subscribeToAppForeground } from './foreground.service'

describe('subscribeToAppForeground', () => {
  const remove = jest.fn()
  let emitAppState: (status: AppStateStatus) => void = () => {}

  beforeEach(() => {
    remove.mockClear()
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
      emitAppState = listener as (status: AppStateStatus) => void
      return { remove }
    })
  })

  afterEach(() => jest.restoreAllMocks())

  it('calls back when the app becomes active', () => {
    const onForeground = jest.fn()
    subscribeToAppForeground(onForeground)

    emitAppState('active')

    expect(onForeground).toHaveBeenCalledTimes(1)
  })

  it('ignores the app going to the background', () => {
    const onForeground = jest.fn()
    subscribeToAppForeground(onForeground)

    emitAppState('background')

    expect(onForeground).not.toHaveBeenCalled()
  })

  it('stops listening when unsubscribed', () => {
    subscribeToAppForeground(jest.fn())()

    expect(remove).toHaveBeenCalledTimes(1)
  })
})

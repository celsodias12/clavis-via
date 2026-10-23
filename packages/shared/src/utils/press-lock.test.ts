import { describe, expect, it, vi } from 'vite-plus/test'
import { runWithPressLock } from './press-lock'

describe('runWithPressLock', () => {
  it('ignores a second call while the first is pending', async () => {
    const lock = { current: false }
    let finish: () => void = () => {}
    const action = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)))

    runWithPressLock(lock, action)
    runWithPressLock(lock, action)
    expect(action).toHaveBeenCalledTimes(1)

    finish()
    await vi.waitFor(() => expect(lock.current).toBe(false))
    runWithPressLock(lock, action)
    expect(action).toHaveBeenCalledTimes(2)
  })

  it('releases the lock when the action throws and rethrows', () => {
    const lock = { current: false }

    expect(() =>
      runWithPressLock(lock, () => {
        throw new Error('boom')
      }),
    ).toThrow('boom')
    expect(lock.current).toBe(false)
  })

  it('releases the lock without an unhandled rejection when the action rejects', async () => {
    const lock = { current: false }

    runWithPressLock(lock, () => Promise.reject(new Error('rejected')))

    await vi.waitFor(() => expect(lock.current).toBe(false))
  })
})

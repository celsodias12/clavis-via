// Runs `action` unless a previous run is still pending. The lock is a plain ref-like object so the check is
// synchronous: it closes the race window between a tap and the parent's pending state, where two quick taps
// would both fire. The caller owns error handling, so a rejected action releases the lock and never becomes
// an unhandled rejection here. The function returns nothing so the UI does not wait on the promise.
export function runWithPressLock(lock: { current: boolean }, action: () => unknown): void {
  if (lock.current) {
    return
  }
  lock.current = true
  const release = () => {
    lock.current = false
  }
  // Promise.try is not available on every runtime (Hermes), so a synchronous throw is released by hand.
  let pending: unknown
  try {
    pending = action()
  } catch (error) {
    release()
    throw error
  }
  Promise.resolve(pending)
    .finally(release)
    .catch(() => {})
}

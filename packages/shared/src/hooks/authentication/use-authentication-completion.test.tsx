import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { useAuthenticationCompletion } from './use-authentication-completion'

const GENERIC_ERROR_KEY = 'screen.authentication.errors.generic'

describe('useAuthenticationCompletion', () => {
  it('finalizes a complete attempt and navigates', async () => {
    const navigate = vi.fn()
    const finalize = vi.fn(async (parameters: { navigate: () => void }) => {
      parameters.navigate()
      return { error: null }
    })
    const { result } = renderHook(() => useAuthenticationCompletion(navigate))

    await act(async () => result.current.complete({ status: 'complete', finalize }))

    expect(finalize).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(result.current.completionErrorKey).toBeUndefined()
  })

  it.each([['needs_second_factor'], [null]])(
    'keeps the generic error and does not finalize an attempt with status %s',
    async (status) => {
      const navigate = vi.fn()
      const finalize = vi.fn()
      const { result } = renderHook(() => useAuthenticationCompletion(navigate))

      await act(async () => result.current.complete({ status, finalize }))

      expect(finalize).not.toHaveBeenCalled()
      expect(navigate).not.toHaveBeenCalled()
      expect(result.current.completionErrorKey).toBe(GENERIC_ERROR_KEY)
    },
  )

  it('keeps the generic error when finalizing fails', async () => {
    const navigate = vi.fn()
    const finalize = vi.fn(async () => ({ error: new Error('boom') }))
    const { result } = renderHook(() => useAuthenticationCompletion(navigate))

    await act(async () => result.current.complete({ status: 'complete', finalize }))

    expect(navigate).not.toHaveBeenCalled()
    expect(result.current.completionErrorKey).toBe(GENERIC_ERROR_KEY)
  })

  it('clears the error when asked', async () => {
    const { result } = renderHook(() => useAuthenticationCompletion(vi.fn()))
    await act(async () => result.current.complete({ status: null, finalize: vi.fn() }))
    expect(result.current.completionErrorKey).toBe(GENERIC_ERROR_KEY)

    act(() => result.current.resetCompletionError())

    expect(result.current.completionErrorKey).toBeUndefined()
  })
})

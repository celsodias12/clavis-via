import { renderHook } from '@testing-library/react'
import { toast } from 'sonner'
import { describe, expect, it, vi } from 'vite-plus/test'
import { useToast } from './use-toast'

vi.mock('sonner', () => ({ toast: vi.fn() }))

describe('useToast', () => {
  it('shows the message as a Sonner toast', () => {
    const { result } = renderHook(() => useToast())

    result.current('Salvo')

    expect(toast).toHaveBeenCalledWith('Salvo')
  })

  it('keeps the same function across renders', () => {
    const { result, rerender } = renderHook(() => useToast())
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
  })
})

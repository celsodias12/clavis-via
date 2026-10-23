import { renderHook } from '@testing-library/react'
import { toast } from 'sonner'
import { describe, expect, it, vi } from 'vite-plus/test'
import { useComingSoon } from './use-coming-soon'

vi.mock('sonner', () => ({ toast: vi.fn() }))

describe('useComingSoon', () => {
  it('shows the translated coming soon toast', () => {
    const { result } = renderHook(() => useComingSoon())

    result.current()

    expect(toast).toHaveBeenCalledWith('Em breve')
  })
})

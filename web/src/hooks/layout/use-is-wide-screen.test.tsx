import { render, renderHook, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { setViewportWidth } from '../../../tests/utils/viewport'
import { useIsWideScreen } from './use-is-wide-screen'

afterEach(() => setViewportWidth(1024))

describe('useIsWideScreen', () => {
  it('is true from 768 px up', () => {
    setViewportWidth(768)
    expect(renderHook(() => useIsWideScreen()).result.current).toBe(true)

    setViewportWidth(767)
    expect(renderHook(() => useIsWideScreen()).result.current).toBe(false)
  })

  it('flips on resize without remounting the child', () => {
    function Child() {
      const isWide = useIsWideScreen()
      const [mountedAt] = useState(() => Math.random())
      return (
        <span data-testid="child" data-mounted-at={mountedAt}>
          {String(isWide)}
        </span>
      )
    }
    setViewportWidth(1024)
    render(<Child />)
    const before = screen.getByTestId('child')
    const mountedAt = before.dataset.mountedAt
    expect(before.textContent).toBe('true')

    setViewportWidth(700)

    const after = screen.getByTestId('child')
    expect(after.textContent).toBe('false')
    expect(after).toBe(before)
    expect(after.dataset.mountedAt).toBe(mountedAt)
  })
})

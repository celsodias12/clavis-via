import { act } from '@testing-library/react'

// Sets the window width and fires the resize event the layout hooks listen to.
export function setViewportWidth(width: number) {
  act(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    window.dispatchEvent(new Event('resize'))
  })
}

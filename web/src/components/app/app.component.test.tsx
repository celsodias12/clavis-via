import { render } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { App } from './app.component'

describe('App', () => {
  it('writes the palette and mounts the providers', () => {
    render(<App />)

    const styles = [...document.querySelectorAll('style')].map((style) => style.textContent)

    expect(styles.some((css) => css?.includes('--color-navy: #264c94;'))).toBe(true)
  })
})

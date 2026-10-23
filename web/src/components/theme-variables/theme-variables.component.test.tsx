import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { colors } from '@clavis-via/shared'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { ThemeVariables } from './theme-variables.component'

// Read from disk: Vitest does not process CSS, so an `?raw` import would be empty.
const globalStyles = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf8')

function renderedCss() {
  const { container } = render(<ThemeVariables />)
  return container.querySelector('style')?.textContent ?? ''
}

describe('ThemeVariables', () => {
  it('writes the shared palette on :root', () => {
    const css = renderedCss()

    expect(css).toContain(':root {')
    expect(css).toContain(`--color-navy: ${colors.navy};`)
    expect(css).toContain('--color-navy: #264c94;')
    expect(css).toContain('--color-wave-top: #f5f2fc;')
  })

  it('flattens nested colors into kebab-case names', () => {
    expect(renderedCss()).toContain(
      `--color-emotions-at-peace-tile: ${colors.emotions.atPeace.tile};`,
    )
  })

  it('leaves gradient stops out', () => {
    expect(renderedCss()).not.toContain('daily-key-card-gradient')
  })

  it('has a Tailwind token in global.css for every variable it writes', () => {
    const variableNames = [...renderedCss().matchAll(/(--color-[a-z0-9-]+):/g)].map(
      ([, name]) => name,
    )

    expect(variableNames.length).toBeGreaterThan(100)
    for (const name of variableNames) {
      expect(globalStyles).toContain(`${name}: var(${name});`)
    }
  })
})

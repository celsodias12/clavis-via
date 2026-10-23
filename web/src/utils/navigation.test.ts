import { TAB_ICON_PATHS } from '@clavis-via/shared'
import { describe, expect, it } from 'vite-plus/test'
import { buildTabIconPaths } from './navigation'

describe('buildTabIconPaths', () => {
  it('outlines an unselected icon without a detail in the inactive color', () => {
    const [body, ...others] = buildTabIconPaths('home', false)

    expect(body.d).toBe(TAB_ICON_PATHS.home.outlineBody)
    expect(body.fill).toBeUndefined()
    expect(body.stroke).toBe('var(--color-tab-bar-inactive-icon)')
    expect(others).toHaveLength(0)
  })

  it('fills a selected icon in the active color', () => {
    const [body] = buildTabIconPaths('journey', true)

    expect(body.d).toBe(TAB_ICON_PATHS.journey.filledBody)
    expect(body.fill).toBe('var(--color-tab-bar-active)')
  })

  it('draws the detail white on a selected icon and inactive otherwise', () => {
    const [, selectedDetail] = buildTabIconPaths('plans', true)
    const [, inactiveDetail] = buildTabIconPaths('plans', false)

    expect(selectedDetail.d).toBe(TAB_ICON_PATHS.plans.detail)
    expect(selectedDetail.stroke).toBe('var(--color-white)')
    expect(inactiveDetail.stroke).toBe('var(--color-tab-bar-inactive-icon)')
  })
})

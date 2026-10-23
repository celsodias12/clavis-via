import { useNow } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { clerkMock } from '../../tests/utils/clerk-mock'
import { router } from '../configs/router.config'
import { ContextProviders } from './index'

function ClockProbe() {
  return <p>{useNow() instanceof Date ? 'clock ready' : 'no clock'}</p>
}

describe('ContextProviders', () => {
  it('provides the clock to its children', () => {
    render(
      <ContextProviders>
        <ClockProbe />
      </ContextProviders>,
    )

    expect(screen.getByText('clock ready')).toBeTruthy()
  })

  it('lets Clerk navigate through the router instead of reloading the page', () => {
    const push = vi.spyOn(router.history, 'push').mockImplementation(() => {})
    const replace = vi.spyOn(router.history, 'replace').mockImplementation(() => {})
    render(
      <ContextProviders>
        <ClockProbe />
      </ContextProviders>,
    )

    clerkMock.providerProps?.routerPush?.('/next')
    clerkMock.providerProps?.routerReplace?.('/other')

    expect(push).toHaveBeenCalledWith('/next')
    expect(replace).toHaveBeenCalledWith('/other')
    push.mockRestore()
    replace.mockRestore()
  })
})

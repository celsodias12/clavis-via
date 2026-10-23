import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { describe, expect, it } from 'vite-plus/test'
import { mockQuery, mockTrpcError } from '../../../tests/utils/api-handlers'
import { server } from '../../../tests/utils/server'
import { createTestProviders } from '../../../tests/utils/test-providers'
import { TRPC_ERROR_CODES } from '../../constants/api.constant'
import { createI18n } from '../../i18n/config'
import { usePlansBrowser } from './use-plans-browser'

const PLANS = [
  { id: 'a', title: 'A', category: 'emotions', totalDays: 3 },
  { id: 'b', title: 'B', category: 'faith', totalDays: 7 },
]

function renderBrowser() {
  const { TestProviders } = createTestProviders()
  const i18n = createI18n('pt-BR')

  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <I18nextProvider i18n={i18n}>
        <TestProviders>{children}</TestProviders>
      </I18nextProvider>
    )
  }

  return { i18n, ...renderHook(() => usePlansBrowser(), { wrapper: Wrapper }) }
}

describe('usePlansBrowser', () => {
  it('is pending, then lists every plan under the translated category chips', async () => {
    server.use(mockQuery('plan.list', () => PLANS))
    const { result, i18n } = renderBrowser()

    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.visiblePlans).toHaveLength(2))

    expect(result.current.isFiltered).toBe(false)
    expect(result.current.options.map((option) => option.label)).toEqual([
      i18n.t('screen.plans.filters.all'),
      i18n.t('screen.plans.filters.emotions'),
      i18n.t('screen.plans.filters.relationships'),
      i18n.t('screen.plans.filters.faith'),
    ])
  })

  it('filters by the selected category and shows every plan again', async () => {
    server.use(mockQuery('plan.list', () => PLANS))
    const { result } = renderBrowser()
    await waitFor(() => expect(result.current.visiblePlans).toHaveLength(2))

    act(() => result.current.setSelectedKey('faith'))
    expect(result.current.isFiltered).toBe(true)
    expect(result.current.selectedKey).toBe('faith')
    expect(result.current.visiblePlans?.map((plan) => plan.id)).toEqual(['b'])

    act(() => result.current.showAll())
    expect(result.current.isFiltered).toBe(false)
    expect(result.current.visiblePlans).toHaveLength(2)
  })

  it('reports a failed load', async () => {
    server.use(mockTrpcError('plan.list', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    const { result } = renderBrowser()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.visiblePlans).toBeUndefined()
  })
})

import { useApi } from '@clavis-via/shared'
import { mockQuery, server } from '@clavis-via/shared/testing'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from '@tanstack/react-router'
import { screen, waitFor } from '@testing-library/react'
import { useTranslation } from 'react-i18next'
import { describe, expect, it } from 'vite-plus/test'
import { renderWithProviders } from './render'

function Probe() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const api = useApi()
  const query = useQuery(api.checkIn.latestForDate.queryOptions({ localDate: '2026-10-19' }))
  return (
    <p>
      {t('common.comingSoon')} {pathname} {query.data ? 'loaded' : 'pending'}
    </p>
  )
}

describe('renderWithProviders', () => {
  it('renders in pt-BR inside the router at the given route, with the API reachable', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => ({ id: 'check-in-1' })))

    const { queryClient } = await renderWithProviders(<Probe />, { route: '/plans/1' })

    expect(screen.getByText(/Em breve \/plans\/1/)).toBeTruthy()
    await waitFor(() => expect(screen.getByText(/loaded/)).toBeTruthy())
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(false)
  })

  it('starts at the root route by default', async () => {
    server.use(mockQuery('checkIn.latestForDate', () => null))

    await renderWithProviders(<Probe />)

    expect(screen.getByText(/Em breve \/ /)).toBeTruthy()
  })
})

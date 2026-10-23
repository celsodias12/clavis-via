import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { mockQuery } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { toLocalDate } from '../../utils/date'
import { useVerseOfDay } from './use-verse-of-day'

function Probe() {
  const { data, isPending } = useVerseOfDay()
  if (isPending) {
    return <span>pending</span>
  }
  return <span>{`${data?.reference}: ${data?.text}`}</span>
}

describe('useVerseOfDay', () => {
  it('asks for the verse of the device local date and returns it', async () => {
    const requested = vi.fn()
    server.use(
      mockQuery('verse.ofDay', (input) => {
        requested(input)
        return { text: 'Porque eu bem sei os planos', reference: 'Jeremias 29:11' }
      }),
    )
    renderWithProviders(<Probe />)
    await waitFor(() =>
      expect(screen.getByText('Jeremias 29:11: Porque eu bem sei os planos')).toBeTruthy(),
    )
    expect(requested).toHaveBeenCalledWith({ localDate: toLocalDate(new Date()) })
  })
})

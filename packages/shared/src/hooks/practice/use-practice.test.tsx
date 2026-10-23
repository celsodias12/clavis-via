import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { mockQuery } from '../../../tests/utils/api-handlers'
import { renderWithProviders } from '../../../tests/utils/render'
import { server } from '../../../tests/utils/server'
import { usePractice } from './use-practice'

function Probe({ practiceId }: Readonly<{ practiceId: string }>) {
  const { data, isPending } = usePractice(practiceId)
  if (isPending) {
    return <span>pending</span>
  }
  return <span>{data?.title}</span>
}

describe('usePractice', () => {
  it('asks for the practice that was given and returns it', async () => {
    const requested = vi.fn()
    server.use(
      mockQuery('practice.byId', (input) => {
        requested(input)
        return { id: 'guided-breathing', title: 'Respiração guiada' }
      }),
    )
    renderWithProviders(<Probe practiceId="guided-breathing" />)
    await waitFor(() => expect(screen.getByText('Respiração guiada')).toBeTruthy())
    expect(requested).toHaveBeenCalledWith({ practiceId: 'guided-breathing' })
  })
})

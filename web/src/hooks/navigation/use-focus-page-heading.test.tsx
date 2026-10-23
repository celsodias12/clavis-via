import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { useFocusPageHeading } from './use-focus-page-heading'

function Page({ withHeading }: Readonly<{ withHeading: boolean }>) {
  useFocusPageHeading()

  return <main data-testid="main">{withHeading ? <h1>Título</h1> : <p>sem título</p>}</main>
}

describe('useFocusPageHeading', () => {
  it('leaves the focus alone on the first render', async () => {
    await renderWithProviders(<Page withHeading />)

    expect(document.activeElement).toBe(document.body)
  })

  it('does not move the focus for a navigation that no user input came before', async () => {
    const { router } = await renderWithProviders(<Page withHeading />)

    await act(async () => router.navigate({ to: ROUTES.PROFILE }))

    expect(document.activeElement).toBe(document.body)
  })

  it('moves the focus to the heading when the route changes', async () => {
    const { router } = await renderWithProviders(<Page withHeading />)

    fireEvent.pointerDown(document.body)
    await act(async () => router.navigate({ to: ROUTES.PROFILE }))

    const heading = screen.getByRole('heading', { name: 'Título' })
    expect(document.activeElement).toBe(heading)
    expect(heading.getAttribute('tabindex')).toBe('-1')
  })

  it('leaves the focus alone when only the hash changes', async () => {
    const { router } = await renderWithProviders(<Page withHeading />)
    fireEvent.pointerDown(document.body)
    await act(async () => router.navigate({ to: ROUTES.PROFILE }))
    act(() => screen.getByRole('heading', { name: 'Título' }).blur())

    await act(async () => router.navigate({ to: ROUTES.PROFILE, hash: 'secao' }))

    expect(document.activeElement).toBe(document.body)
  })

  it('falls back to the main area while the page has no heading', async () => {
    const { router } = await renderWithProviders(<Page withHeading={false} />)

    fireEvent.pointerDown(document.body)
    await act(async () => router.navigate({ to: ROUTES.PROFILE }))

    expect(document.activeElement).toBe(screen.getByTestId('main'))
  })

  it('does nothing when the page has neither', async () => {
    function Bare() {
      useFocusPageHeading()
      return <p>nada</p>
    }
    const { router } = await renderWithProviders(<Bare />)

    fireEvent.pointerDown(document.body)
    await act(async () => router.navigate({ to: ROUTES.PROFILE }))

    expect(document.activeElement).toBe(document.body)
  })
})

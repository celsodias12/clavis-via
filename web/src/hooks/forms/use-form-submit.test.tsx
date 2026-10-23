import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { useFormSubmit } from './use-form-submit'

function Form({ submit }: Readonly<{ submit: () => unknown }>) {
  const onSubmit = useFormSubmit(submit)

  return (
    <form data-testid="form" onSubmit={onSubmit}>
      <input aria-label="Nome completo" />
    </form>
  )
}

describe('useFormSubmit', () => {
  it('runs the submit without letting the browser navigate', () => {
    const submit = vi.fn()
    render(<Form submit={submit} />)

    const notPrevented = fireEvent.submit(screen.getByTestId('form'))

    expect(submit).toHaveBeenCalledTimes(1)
    expect(notPrevented).toBe(false)
  })

  it('sends once for two submits in a row and works again when the first one is done', async () => {
    let finish: () => void = () => {}
    const submit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)))
    render(<Form submit={submit} />)
    const form = screen.getByTestId('form')

    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(submit).toHaveBeenCalledTimes(1)

    finish()
    await waitFor(() => {
      fireEvent.submit(form)
      expect(submit).toHaveBeenCalledTimes(2)
    })
  })
})

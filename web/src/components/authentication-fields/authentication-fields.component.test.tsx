import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { setViewportWidth } from '../../../tests/utils/viewport'
import { AuthenticationFields } from './authentication-fields.component'

function renderFields() {
  render(
    <AuthenticationFields firstLabelBaseline={172}>
      <input aria-label="um" />
      <input aria-label="dois" />
    </AuthenticationFields>,
  )
}

describe('AuthenticationFields', () => {
  it('stacks the fields at the design positions on a phone', () => {
    setViewportWidth(390)
    renderFields()

    expect(screen.getByLabelText('dois').parentElement?.style.top).toContain('calc(')
  })

  it('stacks the fields in the flow of the page on a wide screen', () => {
    renderFields()

    expect(screen.getByLabelText('um')).toBeTruthy()
    expect(screen.getByLabelText('dois').parentElement?.style.top).toBe('')
  })
})

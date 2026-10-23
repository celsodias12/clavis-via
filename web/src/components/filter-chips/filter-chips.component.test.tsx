import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { FilterChips } from './filter-chips.component'

const OPTIONS = [
  { key: 'all', label: 'Todos' },
  { key: 'emotions', label: 'Emoções' },
  { key: 'faith', label: 'Fé' },
]

describe('FilterChips', () => {
  it('renders every option and marks only the selected one', () => {
    render(<FilterChips options={OPTIONS} selectedKey="emotions" onSelect={vi.fn()} />)

    expect(screen.getByText('Todos')).toBeTruthy()
    expect(screen.getByText('Fé')).toBeTruthy()
    expect(
      screen.getByTestId(`${TEST_IDS.FILTER_CHIP_PREFIX}emotions`).getAttribute('aria-pressed'),
    ).toBe('true')
    expect(
      screen.getByTestId(`${TEST_IDS.FILTER_CHIP_PREFIX}all`).getAttribute('aria-pressed'),
    ).toBe('false')
  })

  it('reports the key of the clicked chip', () => {
    const onSelect = vi.fn()
    render(<FilterChips options={OPTIONS} selectedKey="all" onSelect={onSelect} />)

    fireEvent.click(screen.getByText('Fé'))

    expect(onSelect).toHaveBeenCalledWith('faith')
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { SegmentedControl } from './segmented-control.component'

const SEGMENTS = [
  { key: 'overview', label: 'Visão geral' },
  { key: 'content', label: 'Conteúdo' },
  { key: 'reflections', label: 'Reflexões' },
]

describe('SegmentedControl', () => {
  it('renders every segment with its test ID and marks only the selected one', () => {
    render(
      <SegmentedControl
        segments={SEGMENTS}
        selectedKey="content"
        onSelect={vi.fn()}
        testIDPrefix="plan-segment-"
      />,
    )

    for (const segment of SEGMENTS) {
      expect(screen.getByTestId(`plan-segment-${segment.key}`)).toBeTruthy()
      expect(screen.getByText(segment.label)).toBeTruthy()
    }
    expect(screen.getByRole('button', { name: 'Conteúdo' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(screen.getByRole('button', { name: 'Visão geral' }).getAttribute('aria-pressed')).toBe(
      'false',
    )
    expect(screen.getByRole('button', { name: 'Conteúdo' }).children).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Visão geral' }).children).toHaveLength(0)
  })

  it('reports the key of the clicked segment', () => {
    const onSelect = vi.fn()
    render(<SegmentedControl segments={SEGMENTS} selectedKey="overview" onSelect={onSelect} />)

    fireEvent.click(screen.getByText('Reflexões'))

    expect(onSelect).toHaveBeenCalledWith('reflections')
  })

  it('draws the outline variant as separate pills without the underline', () => {
    render(
      <SegmentedControl
        segments={SEGMENTS}
        selectedKey="content"
        onSelect={vi.fn()}
        variant="outline"
      />,
    )

    const selected = screen.getByRole('button', { name: 'Conteúdo' })
    expect(selected.getAttribute('aria-pressed')).toBe('true')
    expect(selected.children).toHaveLength(0)
    expect(selected.className).toContain('bg-white')
    expect(screen.getByRole('button', { name: 'Reflexões' }).className).toContain(
      'bg-pill-background',
    )
  })

  it('draws the solid variant as separate pills with the selected one filled', () => {
    render(
      <SegmentedControl
        segments={SEGMENTS}
        selectedKey="content"
        onSelect={vi.fn()}
        variant="solid"
      />,
    )

    const selected = screen.getByRole('button', { name: 'Conteúdo' })
    expect(selected.children).toHaveLength(0)
    expect(selected.className).toContain('bg-emotions-segment-solid')
    expect(selected.className).toContain('text-white')
    expect(screen.getByRole('button', { name: 'Reflexões' }).className).toContain(
      'bg-pill-background',
    )
  })
})

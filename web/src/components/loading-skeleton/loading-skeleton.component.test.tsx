import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { LoadingSkeleton } from './loading-skeleton.component'

describe('LoadingSkeleton', () => {
  it('is a labelled progress placeholder with the given size', () => {
    render(<LoadingSkeleton className="h-10 w-20" />)

    const skeleton = screen.getByRole('progressbar', { name: 'Carregando' })

    expect(skeleton.className).toContain('h-10 w-20')
    expect(skeleton.className).toContain('animate-pulse')
  })
})

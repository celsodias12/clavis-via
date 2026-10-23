import { TEST_IDS } from '@clavis-via/shared'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { NotFoundScreen } from './not-found.screen'

describe('NotFoundScreen', () => {
  it('explains the error and links to Início', async () => {
    await renderWithProviders(<NotFoundScreen />)

    expect(screen.getByText('Página não encontrada')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.NOT_FOUND_HOME).getAttribute('href')).toBe('/home')
  })
})

import { TEST_IDS, TRPC_ERROR_CODES } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { PlansScreen } from './plans.screen'

vi.mock('sonner', () => ({ toast: vi.fn() }))

const PLANS = [
  {
    id: 'when-discouragement-weighs',
    title: 'Quando o desânimo pesar',
    category: 'emotions',
    totalDays: 3,
  },
  { id: 'after-a-rejection', title: 'Depois de uma rejeição', category: 'emotions', totalDays: 7 },
  {
    id: 'learning-to-set-boundaries',
    title: 'Aprendendo a colocar limites',
    category: 'relationships',
    totalDays: 7,
  },
  {
    id: 'when-your-faith-is-tired',
    title: 'Quando sua fé estiver cansada',
    category: 'faith',
    totalDays: 5,
  },
  {
    id: 'finding-direction-again',
    title: 'Encontrando direção novamente',
    category: 'faith',
    totalDays: 7,
  },
]

async function renderLoaded(plans = PLANS) {
  server.use(mockQuery('plan.list', () => plans))
  const rendered = await renderWithProviders(<PlansScreen />, { route: ROUTES.PLANS })
  await screen.findByText(plans[0]?.title ?? 'Nenhum plano nesta categoria por enquanto.')
  return rendered
}

describe('PlansScreen', () => {
  beforeEach(() => {
    vi.mocked(toast).mockClear()
  })

  it('lists the five plans with their durations and the demo note', async () => {
    await renderLoaded()

    expect(screen.getByRole('heading', { name: 'Planos' })).toBeTruthy()
    for (const plan of PLANS) {
      expect(screen.getByText(plan.title)).toBeTruthy()
    }
    expect(screen.getByText('3 dias')).toBeTruthy()
    expect(screen.getAllByText('7 dias')).toHaveLength(3)
    expect(screen.getByText('Conteúdo fictício, criado para demonstração.')).toBeTruthy()
  })

  it('filters by category and brings everything back with Todos', async () => {
    await renderLoaded()

    fireEvent.click(screen.getByText('Relacionamentos'))
    expect(screen.getByText('Aprendendo a colocar limites')).toBeTruthy()
    expect(screen.queryByText('Quando o desânimo pesar')).toBeNull()
    expect(screen.queryByText('Depois de uma rejeição')).toBeNull()

    fireEvent.click(screen.getByText('Todos'))
    for (const plan of PLANS) {
      expect(screen.getByText(plan.title)).toBeTruthy()
    }
  })

  it('offers the full list again when a category has no plan', async () => {
    await renderLoaded(PLANS.filter((plan) => plan.category !== 'faith'))

    fireEvent.click(screen.getByText('Fé'))
    expect(screen.getByText('Nenhum plano nesta categoria por enquanto.')).toBeTruthy()
    expect(screen.queryByText('Quando o desânimo pesar')).toBeNull()

    fireEvent.click(screen.getByText('Ver todos os planos'))
    expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy()
    expect(screen.queryByText('Nenhum plano nesta categoria por enquanto.')).toBeNull()
  })

  it('shows a welcoming message when there is no plan at all', async () => {
    server.use(mockQuery('plan.list', () => []))
    await renderWithProviders(<PlansScreen />, { route: ROUTES.PLANS })

    await screen.findByTestId(TEST_IDS.PLANS_EMPTY)
    expect(screen.getByText('Nenhum plano nesta categoria por enquanto.')).toBeTruthy()
    expect(screen.queryByText('Ver todos os planos')).toBeNull()
  })

  it('opens the plan from a card', async () => {
    const { router } = await renderLoaded()

    fireEvent.click(screen.getByTestId(`${TEST_IDS.PLANS_ITEM_PREFIX}when-discouragement-weighs`))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/plan/when-discouragement-weighs'),
    )
  })

  it('shows skeleton cards, never a spinner, while the plans load', async () => {
    let release = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      http.get(`${TEST_API_BASE_URL}/trpc/plan.list`, async () => {
        await gate
        return HttpResponse.json({ result: { data: PLANS } })
      }),
    )
    await renderWithProviders(<PlansScreen />, { route: ROUTES.PLANS })

    expect(screen.getAllByRole('progressbar', { name: 'Carregando' })).toHaveLength(5)
    expect(screen.queryByText('Quando o desânimo pesar')).toBeNull()

    await act(async () => release())
    await screen.findByText('Quando o desânimo pesar')
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0)
  })

  it('shows the error state and refetches on Tentar de novo', async () => {
    server.use(mockTrpcError('plan.list', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<PlansScreen />, { route: ROUTES.PLANS })
    await screen.findByText('Tentar de novo')
    expect(screen.getByText('Não foi possível carregar agora.')).toBeTruthy()

    server.use(mockQuery('plan.list', () => PLANS))
    fireEvent.click(screen.getByText('Tentar de novo'))

    await screen.findByText('Quando o desânimo pesar')
    expect(screen.queryByText('Tentar de novo')).toBeNull()
  })

  it('sends the search icon to the coming soon notice', async () => {
    await renderLoaded()

    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(toast).toHaveBeenCalledWith('Em breve')
  })
})

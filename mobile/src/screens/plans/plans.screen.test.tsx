import { TEST_IDS, TRPC_ERROR_CODES } from '@clavis-via/shared'
import { mockQuery, mockTrpcError, server, TEST_API_BASE_URL } from '@clavis-via/shared/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { HttpResponse, http } from 'msw/http'
import { ToastAndroid } from 'react-native'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { PlansScreen } from './plans.screen'

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))
jest.mock(
  'react-native-reanimated',
  () => require('../../../tests/utils/reanimated-mock').reanimatedModule,
)

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

describe('PlansScreen', () => {
  const push = jest.fn()

  beforeEach(() => {
    push.mockClear()
    jest.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>)
  })

  it('lists the five plans with their durations', async () => {
    server.use(mockQuery('plan.list', () => PLANS))
    await renderWithProviders(<PlansScreen />)
    expect(screen.getByText('Planos')).toBeTruthy()
    await waitFor(() => expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy())
    for (const plan of PLANS) {
      expect(screen.getByText(plan.title)).toBeTruthy()
    }
    expect(screen.getByText('3 dias')).toBeTruthy()
    expect(screen.getAllByText('7 dias')).toHaveLength(3)
    expect(screen.getByText('Conteúdo fictício, criado para demonstração.')).toBeTruthy()
  })

  it('filters by category and brings everything back with Todos', async () => {
    server.use(mockQuery('plan.list', () => PLANS))
    await renderWithProviders(<PlansScreen />)
    await waitFor(() => expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy())

    await fireEvent.press(screen.getByText('Relacionamentos'))
    expect(screen.getByText('Aprendendo a colocar limites')).toBeTruthy()
    expect(screen.queryByText('Quando o desânimo pesar')).toBeNull()
    expect(screen.queryByText('Depois de uma rejeição')).toBeNull()

    await fireEvent.press(screen.getByText('Todos'))
    for (const plan of PLANS) {
      expect(screen.getByText(plan.title)).toBeTruthy()
    }
  })

  it('offers the full list again when a category has no plan', async () => {
    server.use(mockQuery('plan.list', () => PLANS.filter((plan) => plan.category !== 'faith')))
    await renderWithProviders(<PlansScreen />)
    await waitFor(() => expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy())

    await fireEvent.press(screen.getByText('Fé'))
    expect(screen.getByText('Nenhum plano nesta categoria por enquanto.')).toBeTruthy()
    expect(screen.queryByText('Quando o desânimo pesar')).toBeNull()

    await fireEvent.press(screen.getByText('Ver todos os planos'))
    expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy()
    expect(screen.queryByText('Nenhum plano nesta categoria por enquanto.')).toBeNull()
  })

  it('shows a welcoming message when there is no plan at all', async () => {
    server.use(mockQuery('plan.list', () => []))
    await renderWithProviders(<PlansScreen />)
    await waitFor(() =>
      expect(screen.getByText('Nenhum plano nesta categoria por enquanto.')).toBeTruthy(),
    )
    expect(screen.queryByText('Ver todos os planos')).toBeNull()
  })

  it('opens the plan screen from a card', async () => {
    server.use(mockQuery('plan.list', () => PLANS))
    await renderWithProviders(<PlansScreen />)
    await waitFor(() => expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy())

    await fireEvent.press(
      screen.getByTestId(`${TEST_IDS.PLANS_ITEM_PREFIX}when-discouragement-weighs`),
    )
    expect(push).toHaveBeenCalledWith({
      pathname: ROUTES.PLAN,
      params: { planId: 'when-discouragement-weighs' },
    })
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
    await renderWithProviders(<PlansScreen />)
    expect(screen.getAllByLabelText('Carregando')).toHaveLength(5)
    expect(JSON.stringify(screen.toJSON())).not.toContain('"ActivityIndicator"')
    expect(screen.queryByText('Quando o desânimo pesar')).toBeNull()

    await act(async () => release())
    await waitFor(() => expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy())
    expect(screen.queryAllByLabelText('Carregando')).toHaveLength(0)
  })

  it('shows the error state and refetches on Tentar de novo', async () => {
    server.use(mockTrpcError('plan.list', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    await renderWithProviders(<PlansScreen />)
    await waitFor(() => expect(screen.getByText('Tentar de novo')).toBeTruthy())
    expect(screen.getByText('Não foi possível carregar agora.')).toBeTruthy()

    server.use(mockQuery('plan.list', () => PLANS))
    await fireEvent.press(screen.getByText('Tentar de novo'))
    await waitFor(() => expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy())
    expect(screen.queryByText('Tentar de novo')).toBeNull()
  })

  it('sends the search icon to the coming soon notice', async () => {
    const show = jest.spyOn(ToastAndroid, 'show').mockImplementation(() => {})
    server.use(mockQuery('plan.list', () => PLANS))
    await renderWithProviders(<PlansScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Buscar' }))
    expect(show).toHaveBeenCalledWith('Em breve', ToastAndroid.SHORT)
    show.mockRestore()
    await waitFor(() => expect(screen.getByText('Quando o desânimo pesar')).toBeTruthy())
  })
})

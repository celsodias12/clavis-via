import { TAB_ROUTE_NAMES, TEST_IDS } from '@clavis-via/shared'
import { mockQuery, server } from '@clavis-via/shared/testing'
import { fireEvent, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, expect, it } from 'vite-plus/test'
import { clerkMock } from '../../../tests/utils/clerk-mock'
import { renderWithProviders } from '../../../tests/utils/render'
import { setViewportWidth } from '../../../tests/utils/viewport'
import { CheckInScreen } from '../../screens/check-in/check-in.screen'
import { DayActionScreen } from '../../screens/day-action/day-action.screen'
import { PlanScreen } from '../../screens/plan/plan.screen'
import { AppShell } from './app-shell.component'

const TAB_NAMES = Object.values(TAB_ROUTE_NAMES)

function renderShell(route: string) {
  return renderWithProviders(
    <AppShell>
      <p>content</p>
    </AppShell>,
    { route },
  )
}

describe('AppShell on a wide screen', () => {
  it('shows the side navigation with the four items and the profile link', async () => {
    setViewportWidth(1024)
    clerkMock.user = { firstName: 'Ana', hasImage: false, imageUrl: '' }

    await renderShell('/home')

    expect(screen.getByTestId(TEST_IDS.SIDE_NAVIGATION)).toBeTruthy()
    for (const name of TAB_NAMES) {
      expect(screen.getByTestId(`${TEST_IDS.TAB_BAR_ITEM_PREFIX}${name}`)).toBeTruthy()
    }
    const profile = screen.getByTestId(TEST_IDS.SIDE_NAVIGATION_PROFILE)
    expect(profile.getAttribute('href')).toBe('/profile')
    expect(profile.textContent).toContain('Ana')
    expect(screen.getByTestId(TEST_IDS.USER_AVATAR)).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.TAB_BAR)).toBeNull()
    expect(screen.getByText('content')).toBeTruthy()
    expect(screen.getByRole('main').textContent).toBe('content')
  })

  it('keeps the side navigation on screens that are not tabs', async () => {
    await renderShell('/profile')

    expect(screen.getByTestId(TEST_IDS.SIDE_NAVIGATION)).toBeTruthy()
  })

  it('has no shell on the Check-in or on /start', async () => {
    await renderShell('/check-in')
    expect(screen.queryByTestId(TEST_IDS.SIDE_NAVIGATION)).toBeNull()
    expect(screen.getByText('content')).toBeTruthy()
  })

  it('has no shell on /start', async () => {
    await renderShell('/start')

    expect(screen.queryByTestId(TEST_IDS.SIDE_NAVIGATION)).toBeNull()
  })
})

describe('AppShell on a narrow screen', () => {
  it('wraps the screen in the main landmark', async () => {
    setViewportWidth(390)

    await renderShell('/profile')

    expect(screen.getByRole('main').textContent).toBe('content')
  })

  it('shows the bottom tabs on a tab route', async () => {
    setViewportWidth(390)

    await renderShell('/home')

    expect(screen.getByTestId(TEST_IDS.TAB_BAR)).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.SIDE_NAVIGATION)).toBeNull()
    for (const name of TAB_NAMES) {
      expect(screen.getByTestId(`${TEST_IDS.TAB_BAR_ITEM_PREFIX}${name}`)).toBeTruthy()
    }
  })

  it('shows no tabs on a screen that is not a tab', async () => {
    setViewportWidth(390)

    await renderShell('/plan/x')

    expect(screen.queryByTestId(TEST_IDS.TAB_BAR)).toBeNull()
    expect(screen.getByText('content')).toBeTruthy()
  })

  it('has no shell on the Check-in', async () => {
    setViewportWidth(390)

    await renderShell('/check-in')

    expect(screen.queryByTestId(TEST_IDS.TAB_BAR)).toBeNull()
  })
})

describe('AppShell across the 768 px breakpoint', () => {
  const WIDE_WIDTH = 1200
  const NARROW_WIDTH = 500

  // Wide, then narrow, then wide again: the way a window snapped to half a screen or a rotated tablet goes.
  function crossTheBreakpoint(check: () => void) {
    setViewportWidth(WIDE_WIDTH)
    check()
    setViewportWidth(NARROW_WIDTH)
    check()
    setViewportWidth(WIDE_WIDTH)
    check()
  }

  it('mounts the screen once, whatever the width', async () => {
    const mounts: string[] = []
    function Probe() {
      useEffect(() => {
        mounts.push('mounted')
      }, [])
      return <p>probe</p>
    }
    setViewportWidth(WIDE_WIDTH)
    await renderWithProviders(
      <AppShell>
        <Probe />
      </AppShell>,
      { route: '/home' },
    )

    crossTheBreakpoint(() => expect(screen.getByText('probe')).toBeTruthy())

    expect(mounts).toHaveLength(1)
  })

  it('keeps the chosen segment of the Plano', async () => {
    server.use(
      mockQuery('plan.detail', () => ({
        id: 'plan-x',
        title: 'Quando o desânimo pesar',
        category: 'emotions',
        totalDays: 3,
        description: 'Um plano curto.',
        isEnrolled: true,
        completedDayNumbers: [1],
        days: [{ dayNumber: 1, title: 'Respirar', summary: 'Pare.' }],
        reflections: [
          {
            dayNumber: 1,
            dayTitle: 'Respirar',
            text: 'Hoje consegui parar um pouco.',
            completedAt: '2026-10-18T15:00:00.000Z',
          },
        ],
      })),
    )
    setViewportWidth(WIDE_WIDTH)
    await renderWithProviders(
      <AppShell>
        <PlanScreen planId="plan-x" />
      </AppShell>,
      { route: '/plan/plan-x' },
    )
    await screen.findByText('Reflexões')
    fireEvent.click(screen.getByTestId(`${TEST_IDS.PLAN_SEGMENT_PREFIX}reflections`))

    crossTheBreakpoint(() => {
      expect(
        screen
          .getByTestId(`${TEST_IDS.PLAN_SEGMENT_PREFIX}reflections`)
          .getAttribute('aria-pressed'),
      ).toBe('true')
      expect(screen.getByText('Hoje consegui parar um pouco.')).toBeTruthy()
    })
  })

  it('keeps the reflection typed on the Ação do dia', async () => {
    server.use(
      mockQuery('plan.day', () => ({
        planId: 'plan-x',
        planTitle: 'Plano',
        totalDays: 7,
        dayNumber: 1,
        title: 'Dia',
        videoDurationSeconds: 60,
        message: 'Mensagem.',
        reflection: 'Reflexão.',
        action: 'Faça algo pequeno.',
        tip: 'Uma dica.',
        prayer: 'Oração.',
        completion: null,
      })),
    )
    setViewportWidth(WIDE_WIDTH)
    await renderWithProviders(
      <AppShell>
        <DayActionScreen planId="plan-x" dayNumber="1" />
      </AppShell>,
      { route: '/plan/plan-x/day/1/action' },
    )
    await screen.findByText('Faça algo pequeno.')
    fireEvent.change(screen.getByTestId(TEST_IDS.DAY_ACTION_REFLECTION), {
      target: { value: 'Consegui dizer não.' },
    })

    crossTheBreakpoint(() =>
      expect(
        (screen.getByTestId(TEST_IDS.DAY_ACTION_REFLECTION) as HTMLTextAreaElement).value,
      ).toBe('Consegui dizer não.'),
    )
  })

  it('keeps the text typed in "Outro" on the Check-in', async () => {
    setViewportWidth(WIDE_WIDTH)
    await renderWithProviders(
      <AppShell>
        <CheckInScreen />
      </AppShell>,
      { route: '/check-in' },
    )
    fireEvent.click(screen.getByRole('radio', { name: 'Outro' }))
    fireEvent.change(screen.getByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT), {
      target: { value: 'Cansada' },
    })

    crossTheBreakpoint(() =>
      expect((screen.getByTestId(TEST_IDS.CHECK_IN_OTHER_TEXT) as HTMLInputElement).value).toBe(
        'Cansada',
      ),
    )
  })
})

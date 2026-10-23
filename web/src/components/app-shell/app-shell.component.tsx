import { useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { SHELL_CLASSES, SHELL_HIDDEN_ROUTES } from '../../constants/layout.constant'
import { TAB_ROUTES } from '../../constants/route.constant'
import { useIsWideScreen } from '../../hooks/layout/use-is-wide-screen'
import { BottomTabs } from '../bottom-tabs/bottom-tabs.component'
import { SideNavigation } from '../side-navigation/side-navigation.component'

type AppShellProps = Readonly<{ children: ReactNode }>

const TAB_PATHS: readonly string[] = Object.values(TAB_ROUTES)

// The frame of the signed in screens. A wide screen gets the side navigation with the content centered beside
// it; a narrow screen gets the app's layout, with the bottom tabs only on the four tab screens. The Check-in
// and the /start splash are outside the shell.
export function AppShell({ children }: AppShellProps) {
  const isWide = useIsWideScreen()
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  if (SHELL_HIDDEN_ROUTES.includes(pathname)) {
    return children
  }

  const hasTabs = !isWide && TAB_PATHS.includes(pathname)

  // One tree for both layouts: the screen keeps the same place (same parents, same index) when the window
  // crosses the breakpoint, so React never remounts it and the state of the screen survives. Only the
  // navigation siblings and the classes change.
  return (
    <div className={shellClassName(isWide, hasTabs)}>
      {isWide ? <SideNavigation /> : null}
      <main className={isWide ? SHELL_CLASSES.WIDE_MAIN : undefined}>
        <div className={isWide ? SHELL_CLASSES.WIDE_CONTENT : undefined}>{children}</div>
      </main>
      {hasTabs ? <BottomTabs /> : null}
    </div>
  )
}

function shellClassName(isWide: boolean, hasTabs: boolean) {
  if (isWide) {
    return SHELL_CLASSES.WIDE
  }
  return hasTabs ? SHELL_CLASSES.NARROW_WITH_TABS : SHELL_CLASSES.NARROW
}

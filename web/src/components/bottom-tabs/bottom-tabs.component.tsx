import { TAB_ITEMS, TEST_IDS } from '@clavis-via/shared'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { SHELL_METRICS } from '../../constants/layout.constant'
import { TAB_ROUTES } from '../../constants/route.constant'
import { useActiveTab } from '../../hooks/navigation/use-active-tab'
import { buildTabIconPaths } from '../../utils/navigation'
import { AppIcon } from '../app-icon/app-icon.component'

// The four tab screens as the app shows them: a bar pinned to the bottom edge of a narrow screen.
export function BottomTabs() {
  const { t } = useTranslation()
  const activeTab = useActiveTab()

  return (
    <nav
      data-testid={TEST_IDS.TAB_BAR}
      aria-label={t('common.navigation')}
      className="fixed inset-x-0 bottom-0 z-10 flex h-[calc(72px+env(safe-area-inset-bottom))] items-start justify-between border-t border-tab-bar-separator bg-tab-bar-background px-6 pt-3 pb-[env(safe-area-inset-bottom)]"
    >
      {TAB_ITEMS.map((item) => {
        const isSelected = activeTab === item.routeName

        return (
          <Link
            key={item.routeName}
            to={TAB_ROUTES[item.routeName]}
            data-testid={`${TEST_IDS.TAB_BAR_ITEM_PREFIX}${item.routeName}`}
            className="flex min-w-14 flex-col items-center gap-1 font-body"
          >
            <AppIcon
              size={SHELL_METRICS.BOTTOM_TABS_ICON_SIZE}
              paths={buildTabIconPaths(item.icon, isSelected)}
            />
            <span
              className={
                isSelected
                  ? 'text-xs font-semibold text-tab-bar-active'
                  : 'text-xs text-tab-bar-inactive-label'
              }
            >
              {t(item.labelKey)}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

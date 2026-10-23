import { TAB_ITEMS, TEST_IDS } from '@clavis-via/shared'
import { useUser } from '@clerk/react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { SHELL_METRICS } from '../../constants/layout.constant'
import { ROUTES, TAB_ROUTES } from '../../constants/route.constant'
import { useActiveTab } from '../../hooks/navigation/use-active-tab'
import { buildTabIconPaths } from '../../utils/navigation'
import { AppIcon } from '../app-icon/app-icon.component'
import { BrandKey } from '../brand-key/brand-key.component'
import { UserAvatar } from '../user-avatar/user-avatar.component'

// The menu of a wide screen: the brand, the four tab screens and the profile of the signed in user.
export function SideNavigation() {
  const { t } = useTranslation()
  const { user } = useUser()
  const activeTab = useActiveTab()

  return (
    <aside
      data-testid={TEST_IDS.SIDE_NAVIGATION}
      style={{ width: SHELL_METRICS.SIDE_NAVIGATION_WIDTH }}
      className="sticky top-0 flex h-svh shrink-0 flex-col border-r border-tab-bar-separator bg-tab-bar-background px-4 py-6"
    >
      <div className="flex items-center gap-3 px-3">
        <BrandKey width={SHELL_METRICS.SIDE_NAVIGATION_KEY_WIDTH} />
        <span className="font-brand text-xl font-light tracking-[0.2em] text-home-brand-text">
          {t('welcome.brand')}
        </span>
      </div>
      <nav aria-label={t('common.navigation')} className="mt-10 flex flex-col gap-1">
        {TAB_ITEMS.map((item) => {
          const isSelected = activeTab === item.routeName

          return (
            <Link
              key={item.routeName}
              to={TAB_ROUTES[item.routeName]}
              data-testid={`${TEST_IDS.TAB_BAR_ITEM_PREFIX}${item.routeName}`}
              className={
                isSelected
                  ? 'flex items-center gap-3 rounded-xl bg-avatar-background px-3 py-3 font-body font-semibold text-tab-bar-active'
                  : 'flex items-center gap-3 rounded-xl px-3 py-3 font-body text-tab-bar-inactive-label hover:bg-avatar-background/50'
              }
            >
              <AppIcon
                size={SHELL_METRICS.NAVIGATION_ICON_SIZE}
                paths={buildTabIconPaths(item.icon, isSelected)}
              />
              {t(item.labelKey)}
            </Link>
          )
        })}
      </nav>
      <Link
        to={ROUTES.PROFILE}
        data-testid={TEST_IDS.SIDE_NAVIGATION_PROFILE}
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 font-body text-title hover:bg-avatar-background/50"
      >
        <UserAvatar size={SHELL_METRICS.AVATAR_SIZE} />
        <span className="truncate">
          <span className="sr-only">{t('screen.profile.title')}: </span>
          {user?.firstName}
        </span>
      </Link>
    </aside>
  )
}

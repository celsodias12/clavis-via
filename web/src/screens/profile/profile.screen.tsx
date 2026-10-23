import { PROFILE_ICONS, PROFILE_MENU_ITEMS, runWithPressLock, TEST_IDS } from '@clavis-via/shared'
import { useClerk, useUser } from '@clerk/react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppIcon } from '../../components/app-icon/app-icon.component'
import { HeaderIconButton } from '../../components/header-icon-button/header-icon-button.component'
import { ListRow } from '../../components/list-row/list-row.component'
import { ScreenHeader } from '../../components/screen-header/screen-header.component'
import { UserAvatar } from '../../components/user-avatar/user-avatar.component'
import { ICON_METRICS } from '../../constants/component.constant'
import { PROFILE_CLASSES } from '../../constants/profile.constant'
import { ROUTES } from '../../constants/route.constant'
import { useComingSoon } from '../../hooks/feedback/use-coming-soon'
import { useIsWideScreen } from '../../hooks/layout/use-is-wide-screen'
import { useGoBack } from '../../hooks/navigation/use-go-back'

// Meu perfil: the photo (or initial), the name, the purpose card and the menu; only "Sair" leads somewhere, the
// rest shows "Em breve". From 1024 px the profile and the purpose sit on the left and the menu on the right;
// from 768 px the title is a left aligned heading with the gear at its right, a phone keeps the app header.
export function ProfileScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useUser()
  const { signOut } = useClerk()
  const showComingSoon = useComingSoon()
  const isWide = useIsWideScreen()
  const goBack = useGoBack(() => navigate({ to: ROUTES.HOME }))

  const [isSigningOut, setIsSigningOut] = useState(false)
  const signOutLock = useRef(false)

  // Synchronous lock: closes the race window between the click and the state update. A failed sign out unlocks
  // the item so the user can try again. A successful one drops everything cached for this account (Clerk has
  // already moved to the after sign out page through the router) and replaces that entry with the entry
  // page; going Back to the profile lands on the private guard, which sends a signed out visitor away.
  const handleSignOut = () =>
    runWithPressLock(signOutLock, async () => {
      setIsSigningOut(true)
      try {
        await signOut()
      } catch {
        setIsSigningOut(false)
        return
      }
      queryClient.clear()
      await navigate({ to: ROUTES.WELCOME, replace: true })
    })

  return (
    <div data-testid={TEST_IDS.PROFILE_SCREEN} className={PROFILE_CLASSES.SCREEN}>
      <div className={PROFILE_CLASSES.PAGE}>
        {isWide ? (
          <div className={PROFILE_CLASSES.HEADER_WIDE}>
            <h1 className={PROFILE_CLASSES.TITLE}>{t('screen.profile.title')}</h1>
            <HeaderIconButton
              icon="settings"
              onPress={showComingSoon}
              accessibilityLabel={t('common.settings')}
            />
          </div>
        ) : (
          <ScreenHeader
            isHeading
            title={t('screen.profile.title')}
            leftIcon="back"
            onLeftPress={goBack}
            rightIcon="settings"
            onRightPress={showComingSoon}
          />
        )}
        <div className={PROFILE_CLASSES.GRID}>
          <div className={PROFILE_CLASSES.LEFT}>
            <section className={PROFILE_CLASSES.PROFILE_CARD}>
              <div className={PROFILE_CLASSES.PHOTO}>
                <UserAvatar
                  size={isWide ? PROFILE_CLASSES.PHOTO_SIZE_WIDE : PROFILE_CLASSES.PHOTO_SIZE_PHONE}
                />
                <button
                  type="button"
                  data-testid={TEST_IDS.PROFILE_EDIT_PHOTO}
                  aria-label={t('screen.profile.changePhoto')}
                  onClick={showComingSoon}
                  className={PROFILE_CLASSES.BADGE}
                >
                  <AppIcon
                    size={PROFILE_CLASSES.BADGE_ICON_SIZE}
                    paths={[
                      {
                        d: PROFILE_ICONS.BADGE_PATH,
                        stroke: ICON_METRICS.CURRENT_COLOR,
                        strokeWidth: PROFILE_ICONS.BADGE_STROKE_WIDTH,
                      },
                    ]}
                  />
                </button>
              </div>
              <p data-testid={TEST_IDS.PROFILE_NAME} className={PROFILE_CLASSES.NAME}>
                {user?.firstName?.trim()}
              </p>
              <p className={PROFILE_CLASSES.SUBTITLE}>{t('screen.profile.subtitle')}</p>
            </section>
            <section className={PROFILE_CLASSES.PURPOSE}>
              <span className={PROFILE_CLASSES.PURPOSE_SQUARE}>
                <AppIcon
                  size={PROFILE_CLASSES.PURPOSE_ICON_SIZE}
                  paths={[
                    {
                      d: PROFILE_ICONS.PURPOSE_PATH,
                      stroke: ICON_METRICS.CURRENT_COLOR,
                      strokeWidth: PROFILE_ICONS.PURPOSE_STROKE_WIDTH,
                    },
                  ]}
                />
              </span>
              <div>
                <h2 className={PROFILE_CLASSES.PURPOSE_TITLE}>
                  {t('screen.profile.purposeTitle')}
                </h2>
                <p className={PROFILE_CLASSES.PURPOSE_TEXT}>{t('screen.profile.purposeText')}</p>
              </div>
            </section>
          </div>
          <nav aria-label={t('screen.profile.title')} className={PROFILE_CLASSES.MENU}>
            {PROFILE_MENU_ITEMS.map((item) => (
              <ListRow
                key={item.key}
                icon={item.icon}
                label={t(item.labelKey)}
                onPress={showComingSoon}
                testID={item.testID}
              />
            ))}
            <ListRow
              icon="logout"
              label={t('screen.profile.menu.signOut')}
              onPress={handleSignOut}
              testID={TEST_IDS.PROFILE_SIGN_OUT}
              hasDivider={false}
              isDisabled={isSigningOut}
            />
          </nav>
        </div>
      </div>
    </div>
  )
}

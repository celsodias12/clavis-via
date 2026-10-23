import type { ListRowIconName } from '../@types/design.type'
import type { TranslationKeys } from '../i18n/types'

// The menu of the Perfil screen, in the order of the design; every item but "Sair" leads to "Em breve".
export const PROFILE_MENU_ITEMS = Object.freeze([
  Object.freeze({
    key: 'subscription',
    icon: 'subscription',
    labelKey: 'screen.profile.menu.subscription',
    testID: 'profile-item-subscription',
  }),
  Object.freeze({
    key: 'settings',
    icon: 'settings',
    labelKey: 'screen.profile.menu.settings',
    testID: 'profile-item-settings',
  }),
  Object.freeze({
    key: 'notifications',
    icon: 'bell',
    labelKey: 'screen.profile.menu.notifications',
    testID: 'profile-item-notifications',
  }),
  Object.freeze({
    key: 'privacy',
    icon: 'lock',
    labelKey: 'screen.profile.menu.privacy',
    testID: 'profile-item-privacy',
  }),
  Object.freeze({
    key: 'help',
    icon: 'help',
    labelKey: 'screen.profile.menu.help',
    testID: 'profile-item-help',
  }),
] satisfies ReadonlyArray<{
  key: string
  icon: ListRowIconName
  labelKey: TranslationKeys
  testID: string
}>)

import type { TabIconName, TabRouteName } from '../@types/tab.type'
import type { TranslationKeys } from '../i18n/types'

// Route file names of the tab group; they double as the suffix of the item test IDs.
export const TAB_ROUTE_NAMES = Object.freeze({
  HOME: 'home',
  PLANS: 'plans',
  CONVERSATION: 'conversation',
  JOURNEY: 'journey',
})

// The four items in the order the design shows them.
export const TAB_ITEMS = Object.freeze([
  Object.freeze({
    routeName: TAB_ROUTE_NAMES.HOME,
    labelKey: 'tabs.home',
    icon: 'home',
  }),
  Object.freeze({
    routeName: TAB_ROUTE_NAMES.PLANS,
    labelKey: 'tabs.plans',
    icon: 'plans',
  }),
  Object.freeze({
    routeName: TAB_ROUTE_NAMES.CONVERSATION,
    labelKey: 'tabs.conversation',
    icon: 'conversation',
  }),
  Object.freeze({
    routeName: TAB_ROUTE_NAMES.JOURNEY,
    labelKey: 'tabs.journey',
    icon: 'journey',
  }),
] satisfies readonly Readonly<{
  routeName: TabRouteName
  labelKey: TranslationKeys
  icon: TabIconName
}>[])

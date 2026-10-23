import type { TAB_ROUTE_NAMES } from '../constants/tab.constant'

export type TabRouteName = (typeof TAB_ROUTE_NAMES)[keyof typeof TAB_ROUTE_NAMES]

export type TabIconName = 'home' | 'plans' | 'conversation' | 'journey'

import { TAB_ROUTE_NAMES } from '@clavis-via/shared'
import { type BottomTabBarProps, Tabs } from 'expo-router/js-tabs'
import { TabBar } from '../../../components/tab-bar/tab-bar.component'

function renderTabBar(props: BottomTabBarProps) {
  return <TabBar {...props} />
}

// The screens are listed in the order of the bar.
export default function TabsLayout() {
  return (
    <Tabs tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name={TAB_ROUTE_NAMES.HOME} />
      <Tabs.Screen name={TAB_ROUTE_NAMES.PLANS} />
      <Tabs.Screen name={TAB_ROUTE_NAMES.CONVERSATION} />
      <Tabs.Screen name={TAB_ROUTE_NAMES.JOURNEY} />
    </Tabs>
  )
}

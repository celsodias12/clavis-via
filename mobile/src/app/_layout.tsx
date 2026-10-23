import { StatusBar } from 'expo-status-bar'
import '../configs/unistyles.config'
import '../i18n/config'
import { RootNavigator } from '../components/root-navigator/root-navigator.component'
import { ContextProviders } from '../contexts'

export default function RootLayout() {
  return (
    <ContextProviders>
      <StatusBar style="dark" />
      <RootNavigator />
    </ContextProviders>
  )
}

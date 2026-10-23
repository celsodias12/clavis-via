import { useAuth } from '@clerk/expo'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { ROUTE_GROUPS, ROUTES } from '../../constants/route.constant'

// Keep the native splash visible until Clerk has restored the session from secure storage.
SplashScreen.preventAutoHideAsync().catch(() => {})

export function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync().catch(() => {})
    }
  }, [isLoaded])

  if (!isLoaded) {
    return null
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSignedIn} redirectTo={ROUTES.START}>
        <Stack.Screen name={ROUTE_GROUPS.PUBLIC} />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(isSignedIn)} redirectTo={ROUTES.WELCOME}>
        <Stack.Screen name={ROUTE_GROUPS.PRIVATE} />
      </Stack.Protected>
    </Stack>
  )
}

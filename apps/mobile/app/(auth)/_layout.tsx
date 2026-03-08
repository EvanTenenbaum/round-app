import { Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'

export default function AuthLayout() {
  const { isSignedIn } = useAuth()
  if (isSignedIn) return <Redirect href="/(tabs)" />

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  )
}

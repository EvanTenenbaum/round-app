import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as SecureStore from 'expo-secure-store'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { api } from '../src/services/api'

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  },
})

// Clerk secure token cache for Expo
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key)
    } catch {
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value)
    } catch {
      // SecureStore unavailable (e.g., emulator without secure enclave)
    }
  },
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ClerkProvider
          publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
          tokenCache={tokenCache}
        >
          <QueryClientProvider client={queryClient}>
            <AuthSetup />
            <StatusBar style="dark" />
          </QueryClientProvider>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

// Wire up Clerk token getter to API client + hide splash
function AuthSetup() {
  const { getToken, isLoaded } = useAuth()

  useEffect(() => {
    api.setTokenGetter(() => getToken())
  }, [getToken])

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync()
    }
  }, [isLoaded])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="invite/[code]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="meals/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="circles/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="members/[id]" options={{ presentation: 'card' }} />
    </Stack>
  )
}

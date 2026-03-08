import { useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../../src/services/api'
import { useAppStore } from '../../src/store/app.store'
import { Colors } from '../../src/styles/theme'

export default function CheckoutSuccessScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { updateUser } = useAppStore()

  useEffect(() => {
    let mounted = true
    const refresh = async () => {
      try {
        const status = await api.getSubscriptionStatus()
        if (!mounted) return
        updateUser({ subscriptionTier: status.tier } as any)
        await queryClient.invalidateQueries()
      } catch {}
      finally {
        if (mounted) router.replace('/(tabs)')
      }
    }
    const t = setTimeout(refresh, 1500)
    return () => { mounted = false; clearTimeout(t) }
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>You're in!</Text>
      <Text style={styles.body}>Setting up your membership…</Text>
      <ActivityIndicator color={Colors.orange} style={{ marginTop: 24 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.gray900, marginBottom: 8 },
  body: { fontSize: 16, color: Colors.gray500 },
})

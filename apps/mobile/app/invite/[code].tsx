import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../src/services/api'
import { useAppStore } from '../../src/store/app.store'
import { Colors } from '../../src/styles/theme'

export default function InviteLanding() {
  const { code } = useLocalSearchParams<{ code: string }>()
  const router = useRouter()
  const { setCurrentCircle } = useAppStore()
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)

  const handleJoin = async () => {
    setJoining(true)
    try {
      await api.joinCircle(code)
      setJoined(true)
      setTimeout(() => router.replace('/(tabs)'), 1500)
    } catch (e: any) {
      if (e.message.includes('upgradeRequired')) {
        Alert.alert(
          'Upgrade needed',
          'You already have a circle on Round (free). Upgrade to Round Member for unlimited circles.',
          [
            { text: 'Maybe later', style: 'cancel' },
            { text: 'Upgrade', onPress: () => router.push('/upgrade') },
          ]
        )
      } else {
        Alert.alert('Could not join', e.message)
      }
      setJoining(false)
    }
  }

  if (joined) {
    return (
      <View style={styles.center}>
        <Ionicons name="checkmark-circle" size={72} color={Colors.green} />
        <Text style={styles.joinedTitle}>You're in!</Text>
        <Text style={styles.joinedSub}>Taking you to your circle…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="people" size={56} color={Colors.orange} />
        <Text style={styles.title}>You've been invited</Text>
        <Text style={styles.body}>
          Someone shared a dinner circle invite with you. Join to see who's cooking this week.
        </Text>
        <View style={styles.codeRow}>
          <Text style={styles.codeLabel}>Invite code</Text>
          <Text style={styles.code}>{code}</Text>
        </View>
        <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} disabled={joining}>
          {joining
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.joinBtnText}>Join circle</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity style={styles.laterBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.laterBtnText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center', padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cream },
  card: { backgroundColor: Colors.white, borderRadius: 20, padding: 28, alignItems: 'center', width: '100%' },
  title: { fontSize: 24, fontWeight: '700', color: Colors.gray900, marginTop: 16, marginBottom: 8 },
  body: { fontSize: 15, color: Colors.gray600, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  codeRow: { backgroundColor: Colors.gray100, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', marginBottom: 20 },
  codeLabel: { fontSize: 11, color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  code: { fontSize: 28, fontWeight: '700', color: Colors.gray900, letterSpacing: 4 },
  joinBtn: { backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  joinBtnText: { color: Colors.white, fontSize: 17, fontWeight: '700' },
  laterBtn: { paddingVertical: 10 },
  laterBtnText: { color: Colors.gray400, fontSize: 15 },
  joinedTitle: { fontSize: 28, fontWeight: '700', color: Colors.gray900, marginTop: 16 },
  joinedSub: { fontSize: 15, color: Colors.gray500, marginTop: 6 },
})

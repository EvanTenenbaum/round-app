import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../src/services/api'
import { useAppStore } from '../../src/store/app.store'
import { Colors } from '../../src/styles/theme'

export default function DiscoverTab() {
  const router = useRouter()
  const { user } = useAppStore()
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isPremium = user?.subscriptionTier === 'MEMBER' || user?.subscriptionTier === 'FOUNDING'

  useEffect(() => {
    if (isPremium) {
      setLoading(true)
      api.getMatchingSuggestions()
        .then(setSuggestions)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }
  }, [isPremium])

  if (!isPremium) {
    return (
      <View style={styles.gateContainer}>
        <View style={styles.gateCard}>
          <Ionicons name="compass" size={48} color={Colors.orange} />
          <Text style={styles.gateTitle}>Find your circle</Text>
          <Text style={styles.gateBody}>
            Round Member automatically matches you with compatible neighbors nearby — so you don't have to round up a circle yourself.
          </Text>
          <View style={styles.gateFeatures}>
            {[
              'Find circles within 2 miles',
              'Matched by dietary needs',
              'See reliability scores before joining',
              'Unlimited circles',
            ].map(f => (
              <View key={f} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.orange} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/upgrade')}>
            <Text style={styles.upgradeBtnText}>Upgrade to Round Member — $7.99/mo</Text>
          </TouchableOpacity>
          <Text style={styles.foundingCta}>
            Or get Founding Member for $49 — every feature, forever.
          </Text>
        </View>
      </View>
    )
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.orange} /></View>
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  if (suggestions.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="compass-outline" size={48} color={Colors.gray300} />
        <Text style={styles.emptyTitle}>No circles nearby yet</Text>
        <Text style={styles.emptyBody}>
          We'll notify you when neighbors in your area join Round.
        </Text>
        <TouchableOpacity
          style={styles.optInBtn}
          onPress={() => api.requestMatching()}
        >
          <Text style={styles.optInBtnText}>Make my profile visible to neighbors</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Circles near you</Text>
      {suggestions.map((circle: any) => (
        <TouchableOpacity
          key={circle.id}
          style={styles.circleCard}
          onPress={() => router.push(`/circles/${circle.id}`)}
        >
          <View style={styles.circleCardHeader}>
            <Text style={styles.circleName}>{circle.name}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{circle.memberCount}/{circle.maxSize}</Text>
            </View>
          </View>
          <Text style={styles.circleLocation}>
            <Ionicons name="location-outline" size={12} /> {circle.neighborhoodName || circle.city}
          </Text>
          {circle.description && (
            <Text style={styles.circleDesc} numberOfLines={2}>{circle.description}</Text>
          )}
          <Text style={styles.joinCta}>View circle →</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: Colors.cream },
  gateContainer: { flex: 1, backgroundColor: Colors.cream, padding: 20, justifyContent: 'center' },
  gateCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 24, alignItems: 'center' },
  gateTitle: { fontSize: 22, fontWeight: '700', color: Colors.gray900, marginTop: 12, marginBottom: 8 },
  gateBody: { fontSize: 15, color: Colors.gray600, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  gateFeatures: { width: '100%', gap: 10, marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14, color: Colors.gray700 },
  upgradeBtn: { backgroundColor: Colors.orange, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, width: '100%', alignItems: 'center' },
  upgradeBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  foundingCta: { marginTop: 12, fontSize: 13, color: Colors.gray500, textAlign: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray900, marginTop: 12 },
  emptyBody: { fontSize: 14, color: Colors.gray500, textAlign: 'center', lineHeight: 20, marginTop: 8, marginBottom: 20 },
  optInBtn: { borderWidth: 1, borderColor: Colors.orange, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  optInBtnText: { color: Colors.orange, fontSize: 14, fontWeight: '600' },
  errorText: { color: Colors.error, fontSize: 14 },
  heading: { fontSize: 20, fontWeight: '700', color: Colors.gray900, margin: 16, marginTop: 60 },
  circleCard: { backgroundColor: Colors.white, marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16 },
  circleCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  circleName: { fontSize: 16, fontWeight: '600', color: Colors.gray900 },
  statusPill: { backgroundColor: Colors.gray100, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 },
  statusText: { fontSize: 12, color: Colors.gray600 },
  circleLocation: { fontSize: 13, color: Colors.gray500, marginBottom: 6 },
  circleDesc: { fontSize: 14, color: Colors.gray600, lineHeight: 20, marginBottom: 8 },
  joinCta: { fontSize: 14, color: Colors.orange, fontWeight: '600' },
})

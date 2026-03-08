import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Linking,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../src/services/api'
import { useAppStore } from '../src/store/app.store'
import { Colors } from '../src/styles/theme'
import { TIER_PRICES } from '@round/shared'

type Plan = 'monthly' | 'annual' | 'founding'

export default function UpgradeScreen() {
  const router = useRouter()
  const { user } = useAppStore()
  const [selected, setSelected] = useState<Plan>('annual')
  const [loading, setLoading] = useState(false)

  const isMember = user?.subscriptionTier === 'MEMBER' || user?.subscriptionTier === 'FOUNDING'

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const { url } = await api.createCheckoutSession(selected)
      await Linking.openURL(url)
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not start checkout. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (isMember) {
    return (
      <View style={styles.alreadyMember}>
        <Ionicons name="checkmark-circle" size={64} color={Colors.orange} />
        <Text style={styles.alreadyMemberTitle}>You're a {user?.subscriptionTier === 'FOUNDING' ? 'Founding Member' : 'Round Member'}</Text>
        <Text style={styles.alreadyMemberBody}>All features are unlocked. Thanks for being part of Round.</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={Colors.gray900} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upgrade Round</Text>
        <Text style={styles.headerSub}>Unlock your neighborhood.</Text>
      </View>

      {/* Free vs Member feature comparison */}
      <View style={styles.featureTable}>
        {[
          { label: '1 circle', free: true, member: false, founding: false },
          { label: 'Unlimited circles', free: false, member: true, founding: true },
          { label: 'Up to 4 neighbors', free: true, member: false, founding: false },
          { label: 'Up to 8 neighbors', free: false, member: true, founding: true },
          { label: 'Post unlimited meals', free: true, member: true, founding: true },
          { label: 'Neighborhood matching', free: false, member: true, founding: true },
          { label: 'Full meal history', free: false, member: true, founding: true },
          { label: 'AI meal suggestions', free: false, member: true, founding: true },
          { label: 'Founding Member badge', free: false, member: false, founding: true },
          { label: 'Lifetime access', free: false, member: false, founding: true },
        ].map(row => (
          <View key={row.label} style={styles.featureRow}>
            <Text style={styles.featureLabel}>{row.label}</Text>
            <View style={styles.featureCheck}>
              {row.free
                ? <Ionicons name="checkmark" size={16} color={Colors.gray500} />
                : <Text style={styles.dash}>–</Text>
              }
            </View>
            <View style={styles.featureCheck}>
              {(row.member || row.founding)
                ? <Ionicons name="checkmark" size={16} color={Colors.orange} />
                : <Text style={styles.dash}>–</Text>
              }
            </View>
          </View>
        ))}
        <View style={styles.featureHeader}>
          <Text style={styles.featureHeaderLabel} />
          <Text style={styles.featureHeaderCol}>Free</Text>
          <Text style={[styles.featureHeaderCol, { color: Colors.orange }]}>Member</Text>
        </View>
      </View>

      {/* Plan picker */}
      <Text style={styles.planSectionTitle}>Choose a plan</Text>

      <TouchableOpacity
        style={[styles.planCard, selected === 'annual' && styles.planCardSelected]}
        onPress={() => setSelected('annual')}
      >
        <View style={styles.planRadio}>
          <View style={[styles.radioOuter, selected === 'annual' && styles.radioOuterActive]}>
            {selected === 'annual' && <View style={styles.radioInner} />}
          </View>
        </View>
        <View style={styles.planInfo}>
          <View style={styles.planRow}>
            <Text style={styles.planName}>Round Member — Annual</Text>
            <View style={styles.savePill}>
              <Text style={styles.savePillText}>Save 38%</Text>
            </View>
          </View>
          <Text style={styles.planPrice}>${TIER_PRICES.ANNUAL}/year · ${(TIER_PRICES.ANNUAL / 12).toFixed(2)}/mo</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.planCard, selected === 'monthly' && styles.planCardSelected]}
        onPress={() => setSelected('monthly')}
      >
        <View style={styles.planRadio}>
          <View style={[styles.radioOuter, selected === 'monthly' && styles.radioOuterActive]}>
            {selected === 'monthly' && <View style={styles.radioInner} />}
          </View>
        </View>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>Round Member — Monthly</Text>
          <Text style={styles.planPrice}>${TIER_PRICES.MONTHLY}/month</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.planCard, styles.foundingCard, selected === 'founding' && styles.planCardSelected]}
        onPress={() => setSelected('founding')}
      >
        <View style={styles.planRadio}>
          <View style={[styles.radioOuter, selected === 'founding' && styles.radioOuterActive]}>
            {selected === 'founding' && <View style={styles.radioInner} />}
          </View>
        </View>
        <View style={styles.planInfo}>
          <View style={styles.planRow}>
            <Text style={styles.planName}>Founding Member</Text>
            <View style={styles.foundingPill}>
              <Text style={styles.foundingPillText}>Launch only</Text>
            </View>
          </View>
          <Text style={styles.planPrice}>${TIER_PRICES.FOUNDING} one-time · Lifetime access</Text>
          <Text style={styles.planSubtext}>Price goes to $89 after launch. Lock in now.</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.upgradeBtn}
        onPress={handleUpgrade}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={Colors.white} />
          : <Text style={styles.upgradeBtnText}>
              {selected === 'founding' ? 'Become a Founding Member' : 'Upgrade to Round Member'}
            </Text>
        }
      </TouchableOpacity>

      <Text style={styles.legalText}>
        Billed via Stripe. Cancel anytime (monthly/annual). Founding Member is a one-time charge.
      </Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  backBtn: { marginTop: 52, marginLeft: 16, width: 36, height: 36, backgroundColor: Colors.white, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  header: { padding: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: Colors.gray900 },
  headerSub: { fontSize: 16, color: Colors.gray500, marginTop: 4 },
  featureTable: { backgroundColor: Colors.white, marginHorizontal: 16, borderRadius: 12, padding: 12, marginBottom: 20 },
  featureHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.gray100, marginBottom: 4 },
  featureHeaderLabel: { flex: 1 },
  featureHeaderCol: { width: 52, textAlign: 'center', fontSize: 12, fontWeight: '600', color: Colors.gray500 },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.gray50 },
  featureLabel: { flex: 1, fontSize: 14, color: Colors.gray700 },
  featureCheck: { width: 52, alignItems: 'center' },
  dash: { fontSize: 14, color: Colors.gray300 },
  planSectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.gray900, marginHorizontal: 16, marginBottom: 10 },
  planCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: Colors.white, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: Colors.gray200 },
  planCardSelected: { borderColor: Colors.orange, backgroundColor: Colors.orange + '06' },
  foundingCard: { borderStyle: 'dashed' },
  planRadio: { marginRight: 12, marginTop: 2 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.gray300, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: Colors.orange },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.orange },
  planInfo: { flex: 1 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  planName: { fontSize: 15, fontWeight: '600', color: Colors.gray900 },
  planPrice: { fontSize: 14, color: Colors.gray600 },
  planSubtext: { fontSize: 12, color: Colors.orange, marginTop: 4 },
  savePill: { backgroundColor: Colors.green + '20', borderRadius: 20, paddingVertical: 3, paddingHorizontal: 8 },
  savePillText: { fontSize: 11, fontWeight: '600', color: Colors.green },
  foundingPill: { backgroundColor: Colors.orange, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 8 },
  foundingPillText: { fontSize: 11, fontWeight: '600', color: Colors.white },
  upgradeBtn: { marginHorizontal: 16, marginTop: 8, backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  upgradeBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  legalText: { textAlign: 'center', fontSize: 12, color: Colors.gray400, marginHorizontal: 24, marginTop: 12, lineHeight: 18 },
  alreadyMember: { flex: 1, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center', padding: 32 },
  alreadyMemberTitle: { fontSize: 22, fontWeight: '700', color: Colors.gray900, marginTop: 16, textAlign: 'center' },
  alreadyMemberBody: { fontSize: 15, color: Colors.gray600, textAlign: 'center', lineHeight: 22, marginTop: 8, marginBottom: 24 },
  doneBtn: { borderWidth: 1, borderColor: Colors.gray300, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
  doneBtnText: { color: Colors.gray700, fontSize: 15 },
})

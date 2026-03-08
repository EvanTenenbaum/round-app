import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Switch,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { api } from '../../src/services/api'
import { useAppStore } from '../../src/store/app.store'
import { Colors } from '../../src/styles/theme'
import { TIER_LABELS } from '@round/shared'

export default function ProfileTab() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { user, setUser, notifications } = useAppStore()
  const [subStatus, setSubStatus] = useState<any>(null)
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    api.getSubscriptionStatus().then(setSubStatus).catch(() => {})
  }, [])

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ])
  }

  if (!user) return null

  const tierLabel = TIER_LABELS[user.subscriptionTier] || 'Round'
  const isMember = user.subscriptionTier === 'MEMBER' || user.subscriptionTier === 'FOUNDING'

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>{user.name[0]}</Text>
          </View>
        )}
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.tierPill}>
          <Text style={styles.tierText}>{tierLabel}</Text>
        </View>
        {user.reliabilityScore != null && (
          <Text style={styles.reliability}>
            {Math.round(user.reliabilityScore * 100)}% reliability
          </Text>
        )}
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/profile/edit')}>
          <Text style={styles.editBtnText}>Edit profile</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <TouchableOpacity style={styles.row} onPress={() => router.push('/notifications')}>
        <Ionicons name="notifications-outline" size={20} color={Colors.gray700} />
        <Text style={styles.rowLabel}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={Colors.gray400} style={styles.rowChevron} />
      </TouchableOpacity>

      {/* Subscription */}
      <Text style={styles.sectionLabel}>Membership</Text>
      {isMember ? (
        <View style={styles.memberCard}>
          <View style={styles.memberCardRow}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.orange} />
            <Text style={styles.memberCardTitle}>{tierLabel}</Text>
            {user.subscriptionTier === 'FOUNDING' && (
              <View style={styles.foundingPill}>
                <Text style={styles.foundingPillText}>Founding Member</Text>
              </View>
            )}
          </View>
          {subStatus?.currentPeriodEnd && user.subscriptionTier === 'MEMBER' && (
            <Text style={styles.memberCardSub}>
              {subStatus.cancelAtPeriodEnd ? 'Cancels' : 'Renews'}{' '}
              {new Date(subStatus.currentPeriodEnd).toLocaleDateString()}
            </Text>
          )}
          {user.subscriptionTier === 'FOUNDING' && (
            <Text style={styles.memberCardSub}>Lifetime access — never expires</Text>
          )}
          {user.subscriptionTier === 'MEMBER' && (
            <TouchableOpacity onPress={() => router.push('/subscription/manage')}>
              <Text style={styles.manageLink}>Manage subscription →</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity style={styles.upgradeCard} onPress={() => router.push('/upgrade')}>
          <View style={styles.upgradeCardRow}>
            <Ionicons name="sparkles" size={20} color={Colors.orange} />
            <Text style={styles.upgradeCardTitle}>Upgrade to Round Member</Text>
          </View>
          <Text style={styles.upgradeCardBody}>
            Unlimited circles, up to 8 neighbors, and automatic matching. $7.99/mo.
          </Text>
          <Text style={styles.upgradeCardCta}>View plans →</Text>
        </TouchableOpacity>
      )}

      {/* Dietary & cooking */}
      <Text style={styles.sectionLabel}>Your cooking profile</Text>
      <TouchableOpacity style={styles.row} onPress={() => router.push('/profile/dietary')}>
        <Ionicons name="leaf-outline" size={20} color={Colors.gray700} />
        <View style={styles.rowContent}>
          <Text style={styles.rowLabel}>Dietary restrictions & allergens</Text>
          {user.dietaryRestrictions?.length > 0 && (
            <Text style={styles.rowSub}>
              {user.dietaryRestrictions.map(r => r.replace('_', ' ').toLowerCase()).join(', ')}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.gray400} style={styles.rowChevron} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => router.push('/profile/cooking')}>
        <Ionicons name="restaurant-outline" size={20} color={Colors.gray700} />
        <View style={styles.rowContent}>
          <Text style={styles.rowLabel}>Cooking styles & skill</Text>
          {user.cookingStyles?.length > 0 && (
            <Text style={styles.rowSub}>{user.cookingStyles.join(', ')}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.gray400} style={styles.rowChevron} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => router.push('/profile/containers')}>
        <Ionicons name="cube-outline" size={20} color={Colors.gray700} />
        <View style={styles.rowContent}>
          <Text style={styles.rowLabel}>Container policy</Text>
          {user.containerPolicy && (
            <Text style={styles.rowSub} numberOfLines={1}>{user.containerPolicy}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.gray400} style={styles.rowChevron} />
      </TouchableOpacity>

      {/* Account */}
      <Text style={styles.sectionLabel}>Account</Text>
      <TouchableOpacity style={styles.row} onPress={() => router.push('/profile/location')}>
        <Ionicons name="location-outline" size={20} color={Colors.gray700} />
        <Text style={styles.rowLabel}>Location</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.gray400} style={styles.rowChevron} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.row, styles.signOutRow]} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={[styles.rowLabel, styles.signOutText]}>Sign out</Text>
      </TouchableOpacity>

      <View style={{ height: 48 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { alignItems: 'center', backgroundColor: Colors.white, paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarFallback: { backgroundColor: Colors.orange + '20', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 32, fontWeight: '700', color: Colors.orange },
  name: { fontSize: 22, fontWeight: '700', color: Colors.gray900, marginTop: 12 },
  email: { fontSize: 14, color: Colors.gray500, marginTop: 2 },
  tierPill: { marginTop: 8, backgroundColor: Colors.orange + '15', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  tierText: { fontSize: 13, color: Colors.orange, fontWeight: '600' },
  reliability: { fontSize: 13, color: Colors.gray500, marginTop: 6 },
  editBtn: { marginTop: 12, borderWidth: 1, borderColor: Colors.gray300, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 20 },
  editBtnText: { fontSize: 14, color: Colors.gray700, fontWeight: '500' },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 0.5, marginHorizontal: 16, marginTop: 24, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingVertical: 14, paddingHorizontal: 16, marginHorizontal: 16, marginBottom: 1, borderRadius: 12, gap: 12 },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, color: Colors.gray900, flex: 1 },
  rowSub: { fontSize: 12, color: Colors.gray400, marginTop: 2 },
  rowChevron: { marginLeft: 'auto' },
  badge: { backgroundColor: Colors.error, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  memberCard: { marginHorizontal: 16, backgroundColor: Colors.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.orange + '30' },
  memberCardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  memberCardTitle: { fontSize: 16, fontWeight: '600', color: Colors.gray900, flex: 1 },
  foundingPill: { backgroundColor: Colors.orange, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 8 },
  foundingPillText: { fontSize: 11, color: Colors.white, fontWeight: '600' },
  memberCardSub: { fontSize: 13, color: Colors.gray500, marginTop: 2 },
  manageLink: { fontSize: 13, color: Colors.orange, fontWeight: '600', marginTop: 8 },
  upgradeCard: { marginHorizontal: 16, backgroundColor: Colors.orange + '10', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.orange + '30' },
  upgradeCardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  upgradeCardTitle: { fontSize: 16, fontWeight: '600', color: Colors.gray900 },
  upgradeCardBody: { fontSize: 14, color: Colors.gray600, lineHeight: 20, marginBottom: 8 },
  upgradeCardCta: { fontSize: 14, color: Colors.orange, fontWeight: '600' },
  signOutRow: { marginTop: 8 },
  signOutText: { color: Colors.error },
})

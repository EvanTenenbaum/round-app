import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Share, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { api } from '../../src/services/api'
import { useAppStore } from '../../src/store/app.store'
import { Colors } from '../../src/styles/theme'
import { DAY_LABELS, CircleDetail, CircleMember } from '@round/shared'

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function CircleTab() {
  const router = useRouter()
  const { currentCircle, user } = useAppStore()
  const [circle, setCircle] = useState<CircleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    if (!currentCircle?.id) { setLoading(false); return }
    try {
      const data = await api.getCircle(currentCircle.id)
      setCircle(data)
    } catch (e) {
      // handled by error state
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentCircle?.id])

  useEffect(() => { load() }, [load])

  const shareInvite = async () => {
    if (!circle?.inviteCode) return
    await Share.share({
      message: `Join my dinner circle on Round! Use invite code: ${circle.inviteCode}\nhttps://round.app/invite/${circle.inviteCode}`,
      title: `Join ${circle.name} on Round`,
    })
  }

  const confirmTurn = async () => {
    if (!circle) return
    try {
      await api.confirmMyTurn(circle.id)
      Alert.alert("You're confirmed!", "Your circle members will see you're cooking tonight.")
    } catch {
      Alert.alert('Error', 'Could not confirm. Try again.')
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.orange} /></View>
  }

  if (!circle) {
    return (
      <View style={styles.empty}>
        <Ionicons name="people-outline" size={56} color={Colors.gray300} />
        <Text style={styles.emptyTitle}>No circle yet</Text>
        <Text style={styles.emptyBody}>
          Start one with your neighbors or join an existing circle with an invite code.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/onboarding')}>
          <Text style={styles.primaryBtnText}>Get started</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const myMember = circle.members.find(m => m.userId === user?.id)
  const myTurnDay = myMember?.turn ? DAY_LABELS[myMember.turn] : null
  const sortedMembers = [...circle.members].sort((a, b) => {
    if (!a.turn) return 1
    if (!b.turn) return -1
    return DAY_ORDER.indexOf(a.turn) - DAY_ORDER.indexOf(b.turn)
  })

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.circleName}>{circle.name}</Text>
          <Text style={styles.circleSubtext}>
            {circle.memberCount} neighbor{circle.memberCount !== 1 ? 's' : ''} · {circle.neighborhoodName || circle.city}
          </Text>
        </View>
        <TouchableOpacity style={styles.inviteBtn} onPress={shareInvite}>
          <Ionicons name="person-add-outline" size={18} color={Colors.orange} />
          <Text style={styles.inviteBtnText}>Invite</Text>
        </TouchableOpacity>
      </View>

      {/* Your turn card */}
      {myTurnDay && (
        <View style={styles.turnCard}>
          <View style={styles.turnLeft}>
            <Text style={styles.turnLabel}>Your turn</Text>
            <Text style={styles.turnDay}>{myTurnDay}s</Text>
          </View>
          <TouchableOpacity style={styles.confirmBtn} onPress={confirmTurn}>
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.orange} />
            <Text style={styles.confirmBtnText}>Confirm I'm cooking</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reliability warning */}
      {myMember && myMember.noShowCount > 0 && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning-outline" size={16} color={Colors.amber} />
          <Text style={styles.warningText}>
            You've missed {myMember.noShowCount} turn{myMember.noShowCount !== 1 ? 's' : ''}.
            Reliability keeps your circle going — please confirm when your turn comes up.
          </Text>
        </View>
      )}

      {/* Members */}
      <Text style={styles.sectionTitle}>Your neighbors</Text>
      {sortedMembers.map(member => (
        <MemberRow key={member.userId} member={member} isMe={member.userId === user?.id} />
      ))}

      {/* Circle capacity */}
      {circle.maxSize - circle.memberCount > 0 && (
        <View style={styles.capacityRow}>
          <Ionicons name="add-circle-outline" size={18} color={Colors.gray400} />
          <Text style={styles.capacityText}>
            Room for {circle.maxSize - circle.memberCount} more neighbor{circle.maxSize - circle.memberCount !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={shareInvite}>
            <Text style={styles.inviteLink}>Invite someone</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Free tier upsell if at 4-member limit */}
      {circle.memberCount >= 4 && user?.subscriptionTier === 'FREE' && (
        <TouchableOpacity style={styles.upsellCard} onPress={() => router.push('/upgrade')}>
          <Text style={styles.upsellTitle}>Want a bigger circle?</Text>
          <Text style={styles.upsellBody}>
            Round Member lets your circle grow to 8 people and unlocks unlimited circles.
          </Text>
          <Text style={styles.upsellCta}>Upgrade to Round Member →</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

function MemberRow({ member, isMe }: { member: CircleMember; isMe: boolean }) {
  const reliabilityColor =
    member.reliabilityRate >= 0.9
      ? Colors.green
      : member.reliabilityRate >= 0.75
      ? Colors.amber
      : Colors.error

  return (
    <View style={styles.memberRow}>
      {member.avatar ? (
        <Image source={{ uri: member.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitial}>{member.name[0]}</Text>
        </View>
      )}
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {member.name}{isMe ? ' (you)' : ''}
          {member.role === 'OWNER' ? ' · Organizer' : ''}
        </Text>
        <Text style={styles.memberTurn}>
          {member.turn ? `Cooks ${DAY_LABELS[member.turn]}s` : 'No turn assigned yet'}
        </Text>
        {member.dietaryRestrictions.length > 0 && (
          <Text style={styles.memberDiet}>
            {member.dietaryRestrictions.map(r => r.replace('_', ' ').toLowerCase()).join(', ')}
          </Text>
        )}
      </View>
      <View style={styles.memberStats}>
        <View style={[styles.reliabilityDot, { backgroundColor: reliabilityColor }]} />
        <Text style={styles.memberStat}>{Math.round(member.reliabilityRate * 100)}%</Text>
        {member.averageRating && (
          <Text style={styles.memberRating}>★ {member.averageRating.toFixed(1)}</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: Colors.cream },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.gray900, marginTop: 16, marginBottom: 8 },
  emptyBody: { fontSize: 15, color: Colors.gray600, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  primaryBtn: { backgroundColor: Colors.orange, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  primaryBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: Colors.white },
  headerText: { flex: 1 },
  circleName: { fontSize: 22, fontWeight: '700', color: Colors.gray900 },
  circleSubtext: { fontSize: 14, color: Colors.gray500, marginTop: 2 },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.orange, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14 },
  inviteBtnText: { color: Colors.orange, fontSize: 14, fontWeight: '600' },
  turnCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 16, padding: 16, backgroundColor: Colors.orange + '15', borderRadius: 12, borderWidth: 1, borderColor: Colors.orange + '40' },
  turnLeft: {},
  turnLabel: { fontSize: 12, color: Colors.orange, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  turnDay: { fontSize: 18, fontWeight: '700', color: Colors.gray900, marginTop: 2 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.white, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: Colors.orange },
  confirmBtnText: { color: Colors.orange, fontSize: 13, fontWeight: '600' },
  warningBanner: { flexDirection: 'row', gap: 8, marginHorizontal: 16, padding: 12, backgroundColor: Colors.amber + '15', borderRadius: 10, borderWidth: 1, borderColor: Colors.amber + '40', alignItems: 'flex-start', marginBottom: 8 },
  warningText: { flex: 1, fontSize: 13, color: Colors.gray700, lineHeight: 18 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.gray500, textTransform: 'uppercase', letterSpacing: 0.5, marginHorizontal: 16, marginTop: 8, marginBottom: 4 },
  memberRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, marginHorizontal: 16, marginVertical: 4, borderRadius: 12, padding: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  avatarFallback: { backgroundColor: Colors.orange + '20', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 18, fontWeight: '700', color: Colors.orange },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: Colors.gray900 },
  memberTurn: { fontSize: 13, color: Colors.gray500, marginTop: 1 },
  memberDiet: { fontSize: 12, color: Colors.gray400, marginTop: 2 },
  memberStats: { alignItems: 'flex-end', gap: 3 },
  reliabilityDot: { width: 8, height: 8, borderRadius: 4 },
  memberStat: { fontSize: 12, color: Colors.gray500 },
  memberRating: { fontSize: 12, color: Colors.amber },
  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 12, padding: 12, backgroundColor: Colors.gray100, borderRadius: 10 },
  capacityText: { flex: 1, fontSize: 14, color: Colors.gray600 },
  inviteLink: { fontSize: 14, color: Colors.orange, fontWeight: '600' },
  upsellCard: { margin: 16, padding: 16, backgroundColor: Colors.orange + '10', borderRadius: 12, borderWidth: 1, borderColor: Colors.orange + '30' },
  upsellTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray900, marginBottom: 4 },
  upsellBody: { fontSize: 14, color: Colors.gray600, lineHeight: 20, marginBottom: 8 },
  upsellCta: { fontSize: 14, fontWeight: '600', color: Colors.orange },
})

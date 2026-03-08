import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../src/services/api'
import { useAppStore } from '../../src/store/app.store'
import { Colors } from '../../src/styles/theme'
import { CircleDetail, DAY_LABELS } from '@round/shared'

export default function CircleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user, setCurrentCircle } = useAppStore()
  const [circle, setCircle] = useState<CircleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    api.getCircle(id).then(setCircle).finally(() => setLoading(false))
  }, [id])

  const isMember = !!circle?.myRole
  const isFull = circle ? circle.memberCount >= circle.maxSize : false

  const handleJoin = async () => {
    if (!circle?.inviteCode) return
    setJoining(true)
    try {
      await api.joinCircle(circle.inviteCode)
      const updated = await api.getCircle(id)
      setCircle(updated)
      setCurrentCircle({ id: circle.id, name: circle.name, status: circle.status, memberCount: updated.memberCount, myRole: updated.myRole })
      Alert.alert("You're in!", `Welcome to ${circle.name}.`)
    } catch (e: any) {
      if (e.message.includes('upgradeRequired')) {
        router.push('/upgrade')
      } else {
        Alert.alert('Could not join', e.message)
      }
    } finally {
      setJoining(false)
    }
  }

  const handleLeave = () => {
    Alert.alert('Leave circle?', 'You can rejoin with the invite code.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.leaveCircle(id)
            setCurrentCircle(null)
            router.back()
          } catch (e: any) {
            Alert.alert('Error', e.message)
          }
        },
      },
    ])
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.orange} /></View>
  }
  if (!circle) {
    return <View style={styles.center}><Text>Circle not found</Text></View>
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={Colors.gray900} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.name}>{circle.name}</Text>
        <Text style={styles.location}>
          <Ionicons name="location-outline" size={14} /> {circle.neighborhoodName || circle.city}
        </Text>
        {circle.description && <Text style={styles.description}>{circle.description}</Text>}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{circle.memberCount}</Text>
            <Text style={styles.statLabel}>neighbors</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{circle.maxSize}</Text>
            <Text style={styles.statLabel}>max size</Text>
          </View>
          <View style={[styles.stat, styles.statLast]}>
            <Text style={[styles.statNum, { color: circle.status === 'ACTIVE' ? Colors.green : Colors.amber }]}>
              {circle.status.charAt(0) + circle.status.slice(1).toLowerCase()}
            </Text>
            <Text style={styles.statLabel}>status</Text>
          </View>
        </View>
      </View>

      {/* Members */}
      <Text style={styles.sectionTitle}>Neighbors</Text>
      {circle.members.map(m => (
        <View key={m.userId} style={styles.memberRow}>
          <View style={styles.memberAvatarFallback}>
            <Text style={styles.memberInitial}>{m.name[0]}</Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>
              {m.name}{m.role === 'OWNER' ? ' · Organizer' : ''}
              {m.userId === user?.id ? ' (you)' : ''}
            </Text>
            <Text style={styles.memberTurn}>
              {m.turn ? `Cooks ${DAY_LABELS[m.turn]}s` : 'No turn assigned'}
            </Text>
            {m.dietaryRestrictions.length > 0 && (
              <Text style={styles.memberDiet}>
                {m.dietaryRestrictions.map(r => r.replace('_', ' ').toLowerCase()).join(', ')}
              </Text>
            )}
          </View>
          <View style={styles.memberRight}>
            <Text style={styles.memberReliability}>{Math.round(m.reliabilityRate * 100)}%</Text>
            {m.averageRating && (
              <Text style={styles.memberRating}>★ {m.averageRating.toFixed(1)}</Text>
            )}
          </View>
        </View>
      ))}

      {/* CTA */}
      {!isMember && (
        <View style={styles.ctaContainer}>
          {isFull ? (
            <View style={styles.fullBanner}>
              <Text style={styles.fullBannerText}>This circle is full ({circle.maxSize}/{circle.maxSize})</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} disabled={joining}>
              {joining
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={styles.joinBtnText}>Join this circle</Text>
              }
            </TouchableOpacity>
          )}
        </View>
      )}

      {isMember && circle.myRole !== 'OWNER' && (
        <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
          <Text style={styles.leaveBtnText}>Leave circle</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 48 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 52, left: 16, zIndex: 10, width: 36, height: 36, backgroundColor: Colors.white, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  header: { backgroundColor: Colors.white, paddingTop: 80, paddingBottom: 20, paddingHorizontal: 20 },
  name: { fontSize: 26, fontWeight: '700', color: Colors.gray900 },
  location: { fontSize: 14, color: Colors.gray500, marginTop: 4 },
  description: { fontSize: 15, color: Colors.gray600, lineHeight: 22, marginTop: 10 },
  statsRow: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  stat: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: Colors.gray100 },
  statLast: { borderRightWidth: 0 },
  statNum: { fontSize: 20, fontWeight: '700', color: Colors.gray900 },
  statLabel: { fontSize: 12, color: Colors.gray400, marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 0.5, marginHorizontal: 16, marginTop: 20, marginBottom: 6 },
  memberRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, marginHorizontal: 16, marginBottom: 4, borderRadius: 12, padding: 12 },
  memberAvatarFallback: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.orange + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  memberInitial: { fontSize: 16, fontWeight: '700', color: Colors.orange },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: Colors.gray900 },
  memberTurn: { fontSize: 13, color: Colors.gray500, marginTop: 1 },
  memberDiet: { fontSize: 12, color: Colors.gray400, marginTop: 2 },
  memberRight: { alignItems: 'flex-end', gap: 2 },
  memberReliability: { fontSize: 12, color: Colors.gray500 },
  memberRating: { fontSize: 12, color: Colors.amber },
  ctaContainer: { margin: 16 },
  joinBtn: { backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  joinBtnText: { color: Colors.white, fontSize: 17, fontWeight: '700' },
  fullBanner: { backgroundColor: Colors.gray100, borderRadius: 12, padding: 14, alignItems: 'center' },
  fullBannerText: { fontSize: 15, color: Colors.gray600 },
  leaveBtn: { marginHorizontal: 16, borderWidth: 1, borderColor: Colors.error + '50', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  leaveBtnText: { color: Colors.error, fontSize: 15, fontWeight: '500' },
})

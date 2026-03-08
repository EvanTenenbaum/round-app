import { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../src/services/api'
import { useAppStore } from '../src/store/app.store'
import { Colors } from '../src/styles/theme'

const NOTIF_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  TURN_REMINDER: 'flame-outline',
  TURN_CONFIRM_REQUEST: 'checkmark-circle-outline',
  SEAT_SAVED: 'person-add-outline',
  CIRCLE_INVITE: 'people-outline',
  CIRCLE_MEMBER_JOINED: 'person-circle-outline',
  MEAL_POSTED: 'restaurant-outline',
  PICKUP_REMINDER: 'time-outline',
  SYSTEM: 'notifications-outline',
}

export default function NotificationsScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setNotifications } = useAppStore()

  const { data: notifications, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.getNotifications,
    staleTime: 30_000,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllMutation = useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0

  const handlePress = (notif: any) => {
    if (!notif.read) markReadMutation.mutate(notif.id)
    if (notif.data?.mealId) router.push(`/meals/${notif.data.mealId}`)
    else if (notif.data?.circleId) router.push(`/circles/${notif.data.circleId}`)
    else if (notif.data?.action === 'confirm_turn' && notif.data?.circleId) {
      router.push(`/(tabs)/circle`)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.title}>Activity</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => markAllMutation.mutate()} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.orange} />
        </View>
      ) : !notifications?.length ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-outline" size={48} color={Colors.gray300} />
          <Text style={styles.emptyTitle}>All caught up</Text>
          <Text style={styles.emptyBody}>Notifications from your circle will appear here.</Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          {notifications.map(notif => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.notifRow, !notif.read && styles.notifUnread]}
              onPress={() => handlePress(notif)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrap, !notif.read && styles.iconWrapActive]}>
                <Ionicons
                  name={NOTIF_ICONS[notif.type] || 'notifications-outline'}
                  size={20}
                  color={notif.read ? Colors.gray500 : Colors.orange}
                />
              </View>
              <View style={styles.notifContent}>
                <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]}>
                  {notif.title}
                </Text>
                <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
                <Text style={styles.notifTime}>{formatRelativeTime(notif.createdAt)}</Text>
              </View>
              {!notif.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  )
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  backBtn: { marginRight: 8 },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: Colors.gray900 },
  markAllBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  markAllText: { fontSize: 13, color: Colors.orange, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray900, marginTop: 12 },
  emptyBody: { fontSize: 14, color: Colors.gray500, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  notifRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray100, backgroundColor: Colors.white },
  notifUnread: { backgroundColor: Colors.orange + '06' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 },
  iconWrapActive: { backgroundColor: Colors.orange + '15' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '500', color: Colors.gray700, marginBottom: 2 },
  notifTitleUnread: { color: Colors.gray900, fontWeight: '600' },
  notifBody: { fontSize: 13, color: Colors.gray500, lineHeight: 18 },
  notifTime: { fontSize: 11, color: Colors.gray400, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.orange, marginTop: 6, marginLeft: 8, flexShrink: 0 },
})

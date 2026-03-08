import { useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, StyleSheet, ActivityIndicator,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { api } from '../services/api'
import { useAppStore } from '../store/app.store'
import { MealCard as MealCardType, DayOfWeek, DAY_LABELS } from '@round/shared'
import { Colors } from '../styles/theme'

export default function HomeScreen() {
  const { user, circles, currentCircle } = useAppStore()
  const activeCircleId = currentCircle?.id || circles[0]?.id

  const { data: meals, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['meals', activeCircleId],
    queryFn: () => activeCircleId ? api.getMealsForCircle(activeCircleId) : Promise.resolve([]),
    enabled: !!activeCircleId,
    staleTime: 60_000,
  })

  const activeCircle = circles.find(c => c.id === activeCircleId) || circles[0]
  const myTurn = activeCircle?.myTurn as DayOfWeek | undefined

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayMeals = meals?.filter(m => {
    const d = new Date(m.cookDate)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  }) ?? []

  const upcomingMeals = meals?.filter(m => {
    const d = new Date(m.cookDate)
    d.setHours(0, 0, 0, 0)
    return d > today
  }).slice(0, 5) ?? []

  const isMyTurnToday = myTurn && DAY_LABELS[myTurn] &&
    new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() === myTurn.slice(0, 3)

  const isMyTurnTomorrow = myTurn &&
    tomorrow.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() === myTurn.slice(0, 3)

  const hasNoShowWarning = circles.some(c => (c as any).noShowCount > 0)

  if (!circles.length) return <NoCircleState />

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.orange} />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.orange} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.name?.split(' ')[0]}
            </Text>
            <Text style={styles.circleName}>{activeCircle?.name}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={Colors.gray700} />
          </TouchableOpacity>
        </View>

        {/* Your turn banner */}
        {isMyTurnToday && (
          <View style={[styles.turnBanner, { backgroundColor: Colors.orange }]}>
            <Ionicons name="flame" size={16} color={Colors.white} />
            <Text style={[styles.turnBannerText, { color: Colors.white }]}>
              It's your turn to cook today
            </Text>
            <TouchableOpacity
              style={styles.turnBannerCta}
              onPress={() => router.push('/(tabs)/post')}
            >
              <Text style={styles.turnBannerCtaText}>Post meal</Text>
            </TouchableOpacity>
          </View>
        )}
        {!isMyTurnToday && isMyTurnTomorrow && (
          <View style={[styles.turnBanner, { backgroundColor: Colors.orange + '15' }]}>
            <Ionicons name="calendar-outline" size={16} color={Colors.orange} />
            <Text style={[styles.turnBannerText, { color: Colors.orange }]}>
              Your turn is tomorrow — {DAY_LABELS[myTurn!]}
            </Text>
          </View>
        )}
        {!isMyTurnToday && !isMyTurnTomorrow && myTurn && (
          <View style={styles.myTurnRow}>
            <Ionicons name="restaurant-outline" size={14} color={Colors.gray400} />
            <Text style={styles.myTurnText}>
              You cook {DAY_LABELS[myTurn]}s
            </Text>
          </View>
        )}
      </View>

      {/* No-show warning */}
      {hasNoShowWarning && (
        <View style={styles.warnBanner}>
          <Ionicons name="warning-outline" size={14} color={Colors.amber} />
          <Text style={styles.warnText}>
            You've missed a recent turn. Your circle is counting on you.
          </Text>
        </View>
      )}

      {/* Today */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tonight</Text>
        {todayMeals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {isMyTurnToday
                ? "You haven't posted your meal yet."
                : "No meal posted for tonight yet."}
            </Text>
            {isMyTurnToday && (
              <TouchableOpacity
                style={styles.postBtn}
                onPress={() => router.push('/(tabs)/post')}
              >
                <Text style={styles.postBtnText}>Post your meal</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          todayMeals.map(meal => (
            <HomeMealCard
              key={meal.id}
              meal={meal}
              myId={user?.id}
              onPress={() => router.push(`/meals/${meal.id}`)}
            />
          ))
        )}
      </View>

      {/* This week */}
      {upcomingMeals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This week</Text>
          {upcomingMeals.map(meal => (
            <HomeMealCard
              key={meal.id}
              meal={meal}
              myId={user?.id}
              onPress={() => router.push(`/meals/${meal.id}`)}
            />
          ))}
        </View>
      )}

      {/* Quick actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/post')}>
          <Ionicons name="add-circle" size={26} color={Colors.orange} />
          <Text style={styles.actionLabel}>Post meal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/circle')}>
          <Ionicons name="people" size={26} color={Colors.green} />
          <Text style={styles.actionLabel}>My circle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={26} color={Colors.gray700} />
          <Text style={styles.actionLabel}>Activity</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  )
}

function HomeMealCard({ meal, myId, onPress }: { meal: MealCardType; myId?: string; onPress: () => void }) {
  const hasSeat = !!meal.mySeat
  const isMine = meal.cookId === myId
  const isFull = meal.status === 'FULL'
  const seatsLeft = meal.servingsAvailable - meal.servingsSaved

  return (
    <TouchableOpacity style={styles.mealCard} onPress={onPress} activeOpacity={0.85}>
      {meal.photo ? (
        <Image source={{ uri: meal.photo }} style={styles.mealPhoto} contentFit="cover" />
      ) : (
        <View style={[styles.mealPhoto, styles.mealPhotoEmpty]}>
          <Ionicons name="restaurant" size={28} color={Colors.gray300} />
        </View>
      )}
      <View style={styles.mealBody}>
        <View style={styles.mealTitleRow}>
          <Text style={styles.mealTitle} numberOfLines={1}>{meal.title}</Text>
          {hasSeat && (
            <View style={styles.seatBadge}>
              <Text style={styles.seatBadgeText}>✓ Seat saved</Text>
            </View>
          )}
          {isMine && (
            <View style={[styles.seatBadge, { backgroundColor: Colors.orange + '20' }]}>
              <Text style={[styles.seatBadgeText, { color: Colors.orange }]}>Your meal</Text>
            </View>
          )}
          {!hasSeat && !isMine && isFull && (
            <View style={[styles.seatBadge, { backgroundColor: Colors.gray100 }]}>
              <Text style={[styles.seatBadgeText, { color: Colors.gray500 }]}>Full</Text>
            </View>
          )}
        </View>
        <Text style={styles.mealMeta}>
          by {meal.cook.name} · {formatTime(meal.pickupTime)}
        </Text>
        {!isFull && !hasSeat && !isMine && (
          <Text style={styles.seatsLeft}>{seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left</Text>
        )}
        {meal.allergenNotes && (
          <Text style={styles.allergenNote} numberOfLines={1}>
            ⚠ {meal.allergenNotes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

function NoCircleState() {
  return (
    <View style={styles.noCircleContainer}>
      <Text style={styles.noCircleEmoji}>⭕</Text>
      <Text style={styles.noCircleTitle}>Welcome to Round</Text>
      <Text style={styles.noCircleBody}>
        Start a dinner circle with your neighbors or join one with an invite code.
        Cook once a week. Eat home-cooked meals the rest.
      </Text>
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => router.push('/onboarding')}
      >
        <Text style={styles.primaryBtnText}>Get started</Text>
      </TouchableOpacity>
    </View>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cream },
  header: { backgroundColor: Colors.white, paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  greeting: { fontSize: 22, fontWeight: '700', color: Colors.gray900 },
  circleName: { fontSize: 14, color: Colors.gray500, marginTop: 2 },
  turnBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  turnBannerText: { flex: 1, fontSize: 14, fontWeight: '500' },
  turnBannerCta: { backgroundColor: Colors.white + 'CC', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  turnBannerCtaText: { fontSize: 13, fontWeight: '700', color: Colors.orange },
  myTurnRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  myTurnText: { fontSize: 13, color: Colors.gray400 },
  warnBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.amber + '15', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.amber + '30' },
  warnText: { flex: 1, fontSize: 13, color: Colors.gray700, lineHeight: 18 },
  section: { padding: 16, paddingBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray900, marginBottom: 10 },
  emptyCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14, color: Colors.gray500, textAlign: 'center', marginBottom: 12 },
  postBtn: { backgroundColor: Colors.orange, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20 },
  postBtnText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  mealCard: { backgroundColor: Colors.white, borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
  mealPhoto: { width: '100%', height: 140, backgroundColor: Colors.gray100 },
  mealPhotoEmpty: { alignItems: 'center', justifyContent: 'center' },
  mealBody: { padding: 12 },
  mealTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  mealTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.gray900 },
  seatBadge: { backgroundColor: Colors.green + '20', borderRadius: 10, paddingVertical: 3, paddingHorizontal: 8 },
  seatBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.green },
  mealMeta: { fontSize: 13, color: Colors.gray500 },
  seatsLeft: { fontSize: 12, color: Colors.orange, marginTop: 3, fontWeight: '500' },
  allergenNote: { fontSize: 11, color: Colors.amber, marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, paddingTop: 20 },
  actionBtn: { alignItems: 'center', backgroundColor: Colors.white, borderRadius: 14, padding: 14, width: 88, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  actionLabel: { fontSize: 12, fontWeight: '500', color: Colors.gray700, marginTop: 6 },
  noCircleContainer: { flex: 1, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center', padding: 32 },
  noCircleEmoji: { fontSize: 64, marginBottom: 16 },
  noCircleTitle: { fontSize: 26, fontWeight: '700', color: Colors.gray900, marginBottom: 10 },
  noCircleBody: { fontSize: 15, color: Colors.gray600, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  primaryBtn: { backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  primaryBtnText: { color: Colors.white, fontSize: 17, fontWeight: '700' },
})

import React, { useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Image,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../services/api'
import { useAppStore } from '../store/app.store'
import { MealCard as MealCardType, DayOfWeek, DAY_LABELS } from '@round/shared'
import { Colors, Typography, Spacing } from '../styles/theme'

export default function HomeScreen() {
  const { user, circles } = useAppStore()
  const activePodId = circles[0]?.id // show first circle on home

  const {
    data: meals,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['meals', activePodId],
    queryFn: () => activePodId ? api.getMealsForPod(activePodId) : Promise.resolve([]),
    enabled: !!activePodId,
    staleTime: 60_000, // 1 min
  })

  const todayMeals = meals?.filter(m => {
    const mealDate = new Date(m.cookDate)
    const today = new Date()
    return mealDate.toDateString() === today.toDateString()
  }) || []

  const upcomingMeals = meals?.filter(m => {
    const mealDate = new Date(m.cookDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return mealDate > today
  }).slice(0, 4) || []

  const myCircleMembership = circles[0]
  const myNextCookDay = myCircleMembership?.myTurn

  if (!circles.length) {
    return <NoPodState />
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.orange} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={[Colors.cream, Colors.creamLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()}, {user?.name?.split(' ')[0]}! 👋</Text>
            <Text style={styles.subgreeting}>{circles[0]?.name}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={Colors.brown} />
          </TouchableOpacity>
        </View>

        {/* Your next cook day */}
        {myNextCookDay && (
          <View style={styles.cookDayBanner}>
            <Ionicons name="flame-outline" size={18} color={Colors.orange} />
            <Text style={styles.cookDayText}>
              Your cook day: <Text style={{ fontWeight: '700' }}>{DAY_LABELS[myNextCookDay as DayOfWeek]}</Text>
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Today's meals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today</Text>
        {todayMeals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No meals posted for today yet.</Text>
            <TouchableOpacity
              style={styles.postButton}
              onPress={() => router.push('/post-meal')}
            >
              <Text style={styles.postButtonText}>Post a meal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          todayMeals.map(meal => (
            <MealCard key={meal.id} meal={meal} onPress={() => router.push(`/meals/${meal.id}`)} />
          ))
        )}
      </View>

      {/* Upcoming this week */}
      {upcomingMeals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This week</Text>
          {upcomingMeals.map(meal => (
            <MealCard key={meal.id} meal={meal} onPress={() => router.push(`/meals/${meal.id}`)} />
          ))}
        </View>
      )}

      {/* Quick actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/post-meal')}
        >
          <Ionicons name="add-circle" size={28} color={Colors.orange} />
          <Text style={styles.actionLabel}>Post Meal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/circles')}
        >
          <Ionicons name="people" size={28} color={Colors.green} />
          <Text style={styles.actionLabel}>My Pod</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/schedule')}
        >
          <Ionicons name="calendar" size={28} color={Colors.brown} />
          <Text style={styles.actionLabel}>Schedule</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  )
}

function MealCard({ meal, onPress }: { meal: MealCardType; onPress: () => void }) {
  const claimed = meal.mySave a seat != null
  const full = meal.servingsClaimed >= meal.servingsAvailable

  return (
    <TouchableOpacity style={styles.mealCard} onPress={onPress} activeOpacity={0.8}>
      {meal.photo && (
        <Image source={{ uri: meal.photo }} style={styles.mealPhoto} />
      )}
      <View style={styles.mealInfo}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealTitle}>{meal.title}</Text>
          {claimed && (
            <View style={styles.claimedBadge}>
              <Text style={styles.claimedBadgeText}>✓ Claimed</Text>
            </View>
          )}
          {!claimed && full && (
            <View style={[styles.claimedBadge, { backgroundColor: Colors.brown + '20' }]}>
              <Text style={[styles.claimedBadgeText, { color: Colors.brown }]}>Full</Text>
            </View>
          )}
        </View>
        <View style={styles.mealMeta}>
          <Text style={styles.cookName}>by {meal.cook.name}</Text>
          <Text style={styles.mealTime}>
            {formatPickupTime(meal.pickupTime)} · {meal.servingsAvailable - meal.servingsClaimed} left
          </Text>
        </View>
        {meal.cuisineType && (
          <Text style={styles.cuisineTag}>{meal.cuisineType}</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

function NoPodState() {
  return (
    <View style={styles.noPodContainer}>
      <Text style={styles.noPodEmoji}>🏠</Text>
      <Text style={styles.noPodTitle}>Welcome to Round!</Text>
      <Text style={styles.noPodSubtitle}>
        Join a meal co-op circle with neighbors or friends to start sharing home-cooked meals.
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/circles/new')}>
        <Text style={styles.primaryButtonText}>Create a Pod</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/circles/join')}>
        <Text style={styles.secondaryButtonText}>Join with Invite Code</Text>
      </TouchableOpacity>
    </View>
  )
}

function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function formatPickupTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.creamLight },
  header: { padding: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.md },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 22, fontWeight: '700', color: Colors.brown },
  subgreeting: { fontSize: 14, color: Colors.brownLight, marginTop: 2 },
  cookDayBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: Spacing.sm, backgroundColor: Colors.orange + '15',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
  },
  cookDayText: { fontSize: 14, color: Colors.brown },
  section: { padding: Spacing.lg, paddingBottom: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.brown, marginBottom: Spacing.sm },
  emptyState: { alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.white, borderRadius: 16 },
  emptyText: { fontSize: 14, color: Colors.brownLight, marginBottom: Spacing.md },
  postButton: { backgroundColor: Colors.orange, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  postButtonText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  mealCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    shadowColor: Colors.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mealPhoto: { width: '100%', height: 160, backgroundColor: Colors.creamLight },
  mealInfo: { padding: Spacing.md },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealTitle: { fontSize: 16, fontWeight: '600', color: Colors.brown, flex: 1 },
  claimedBadge: {
    backgroundColor: Colors.green + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  claimedBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.green },
  mealMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  cookName: { fontSize: 13, color: Colors.brownLight },
  mealTime: { fontSize: 13, color: Colors.brownLight },
  cuisineTag: { fontSize: 11, color: Colors.orange, marginTop: 4, fontWeight: '500' },
  quickActions: {
    flexDirection: 'row', justifyContent: 'space-around',
    padding: Spacing.lg, paddingTop: Spacing.xl,
  },
  actionCard: {
    alignItems: 'center', backgroundColor: Colors.white,
    padding: Spacing.md, borderRadius: 16, width: 90,
    shadowColor: Colors.brown, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  actionLabel: { fontSize: 12, fontWeight: '500', color: Colors.brown, marginTop: 6 },
  noPodContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, paddingTop: 80 },
  noPodEmoji: { fontSize: 64, marginBottom: Spacing.md },
  noPodTitle: { fontSize: 24, fontWeight: '700', color: Colors.brown, marginBottom: Spacing.sm },
  noPodSubtitle: { fontSize: 15, color: Colors.brownLight, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22 },
  primaryButton: {
    backgroundColor: Colors.orange, paddingHorizontal: 40, paddingVertical: 14,
    borderRadius: 28, width: '100%', alignItems: 'center', marginBottom: Spacing.sm,
  },
  primaryButtonText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  secondaryButton: {
    borderWidth: 2, borderColor: Colors.orange, paddingHorizontal: 40, paddingVertical: 14,
    borderRadius: 28, width: '100%', alignItems: 'center',
  },
  secondaryButtonText: { color: Colors.orange, fontWeight: '700', fontSize: 16 },
})

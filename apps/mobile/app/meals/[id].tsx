import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { api } from '../../src/services/api'
import { useAppStore } from '../../src/store/app.store'
import { Colors } from '../../src/styles/theme'
import { MealCard } from '@round/shared'

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAppStore()
  const [meal, setMeal] = useState<MealCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getMeal(id).then(setMeal).finally(() => setLoading(false))
  }, [id])

  const hasSeat = !!meal?.mySeat
  const isMyMeal = meal?.cookId === user?.id
  const isFull = meal?.status === 'FULL'
  const canSave = meal?.status === 'POSTED' && !isMyMeal && !hasSeat

  const handleSaveSeat = async () => {
    if (!meal) return
    setSaving(true)
    try {
      await api.saveASeat(meal.id)
      const updated = await api.getMeal(id)
      setMeal(updated)
    } catch (e: any) {
      Alert.alert('Could not save seat', e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUnsaveSeat = async () => {
    if (!meal) return
    Alert.alert(
      'Remove your seat?',
      'You can only unsave up to 2 hours before pickup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove seat',
          style: 'destructive',
          onPress: async () => {
            setSaving(true)
            try {
              await api.unsaveSeat(meal.id)
              const updated = await api.getMeal(id)
              setMeal(updated)
            } catch (e: any) {
              Alert.alert('Error', e.message)
            } finally {
              setSaving(false)
            }
          },
        },
      ]
    )
  }

  const handleCancelMeal = async () => {
    if (!meal) return
    Alert.alert(
      'Cancel this meal?',
      'Everyone who saved a seat will be notified immediately.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel meal',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.cancelMeal(meal.id)
              router.back()
            } catch (e: any) {
              Alert.alert('Error', e.message)
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.orange} /></View>
  }
  if (!meal) {
    return <View style={styles.center}><Text>Meal not found</Text></View>
  }

  const pickupDate = new Date(meal.pickupTime)

  return (
    <ScrollView style={styles.container}>
      {/* Photo */}
      {meal.photo ? (
        <Image source={{ uri: meal.photo }} style={styles.photo} contentFit="cover" />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Ionicons name="restaurant" size={48} color={Colors.gray300} />
        </View>
      )}

      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={Colors.gray900} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{meal.title}</Text>
          {meal.status === 'FULL' && (
            <View style={styles.fullPill}><Text style={styles.fullPillText}>Full</Text></View>
          )}
        </View>

        {/* Cook */}
        <View style={styles.cookRow}>
          <Ionicons name="person-circle-outline" size={18} color={Colors.gray500} />
          <Text style={styles.cookName}>
            {isMyMeal ? 'Your meal' : `Cooked by ${meal.cook.name}`}
          </Text>
        </View>

        {/* Pickup info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={Colors.orange} />
            <Text style={styles.infoText}>
              {pickupDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              {' at '}
              {pickupDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={Colors.orange} />
            <Text style={styles.infoText}>{meal.pickupLocation}</Text>
          </View>
          {meal.pickupNotes && (
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.gray400} />
              <Text style={styles.infoTextSub}>{meal.pickupNotes}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="cube-outline" size={16} color={Colors.gray400} />
            <Text style={styles.infoTextSub}>{meal.containerPolicy}</Text>
          </View>
        </View>

        {/* Servings */}
        <View style={styles.servingsRow}>
          <Text style={styles.servingsText}>
            {meal.servingsSaved} of {meal.servingsAvailable} seats saved
          </Text>
          <View style={styles.servingsBar}>
            <View
              style={[
                styles.servingsBarFill,
                { width: `${(meal.servingsSaved / meal.servingsAvailable) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Description */}
        {meal.description && (
          <Text style={styles.description}>{meal.description}</Text>
        )}

        {/* Dietary tags */}
        {meal.dietaryTags.length > 0 && (
          <View style={styles.tagRow}>
            {meal.dietaryTags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag.replace('_', ' ')}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Allergen notes */}
        {meal.allergenNotes && (
          <View style={styles.allergenCard}>
            <Ionicons name="warning-outline" size={16} color={Colors.amber} />
            <Text style={styles.allergenText}>{meal.allergenNotes}</Text>
          </View>
        )}

        {/* Who has seats */}
        {meal.seats && meal.seats.length > 0 && (
          <View style={styles.seatsSection}>
            <Text style={styles.seatsSectionTitle}>Seats saved</Text>
            {meal.seats.map(seat => (
              <View key={seat.id} style={styles.seatRow}>
                <Ionicons name="person-circle-outline" size={20} color={Colors.gray400} />
                <Text style={styles.seatName}>{seat.diner.name}</Text>
                <Text style={styles.seatPortions}>{seat.portions}×</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        {canSave && (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveSeat}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.saveBtnText}>Save a seat</Text>
            }
          </TouchableOpacity>
        )}

        {hasSeat && (
          <View style={styles.savedContainer}>
            <View style={styles.savedBadge}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
              <Text style={styles.savedText}>Your seat is saved</Text>
            </View>
            <TouchableOpacity onPress={handleUnsaveSeat} disabled={saving}>
              <Text style={styles.unsaveLink}>Remove seat</Text>
            </TouchableOpacity>
          </View>
        )}

        {isMyMeal && meal.status !== 'CANCELLED' && meal.status !== 'DONE' && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelMeal}>
            <Text style={styles.cancelBtnText}>Cancel this meal</Text>
          </TouchableOpacity>
        )}

        {isFull && !hasSeat && !isMyMeal && (
          <View style={styles.fullBanner}>
            <Text style={styles.fullBannerText}>All seats are taken for this meal.</Text>
          </View>
        )}
      </View>

      <View style={{ height: 48 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: 260 },
  photoPlaceholder: { width: '100%', height: 200, backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 52, left: 16, width: 36, height: 36, backgroundColor: Colors.white + 'E0', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.gray900, flex: 1, lineHeight: 30 },
  fullPill: { backgroundColor: Colors.gray200, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, marginTop: 4 },
  fullPillText: { fontSize: 12, color: Colors.gray600, fontWeight: '600' },
  cookRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 16 },
  cookName: { fontSize: 14, color: Colors.gray500 },
  infoCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 14, gap: 10, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoText: { fontSize: 14, color: Colors.gray800, flex: 1 },
  infoTextSub: { fontSize: 13, color: Colors.gray500, flex: 1 },
  servingsRow: { marginBottom: 16 },
  servingsText: { fontSize: 14, color: Colors.gray600, marginBottom: 6 },
  servingsBar: { height: 6, backgroundColor: Colors.gray200, borderRadius: 3 },
  servingsBarFill: { height: '100%', backgroundColor: Colors.orange, borderRadius: 3 },
  description: { fontSize: 15, color: Colors.gray700, lineHeight: 22, marginBottom: 16 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { backgroundColor: Colors.green + '20', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  tagText: { fontSize: 12, color: Colors.green, fontWeight: '600' },
  allergenCard: { flexDirection: 'row', gap: 8, backgroundColor: Colors.amber + '10', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.amber + '30', marginBottom: 16, alignItems: 'flex-start' },
  allergenText: { fontSize: 13, color: Colors.gray700, flex: 1, lineHeight: 18 },
  seatsSection: { marginBottom: 20 },
  seatsSectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.gray500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  seatRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  seatName: { flex: 1, fontSize: 14, color: Colors.gray800 },
  seatPortions: { fontSize: 14, color: Colors.gray500 },
  saveBtn: { backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: Colors.white, fontSize: 17, fontWeight: '700' },
  savedContainer: { alignItems: 'center', gap: 8, marginTop: 8 },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  savedText: { fontSize: 16, fontWeight: '600', color: Colors.green },
  unsaveLink: { fontSize: 14, color: Colors.gray400 },
  cancelBtn: { borderWidth: 1, borderColor: Colors.error + '50', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  cancelBtnText: { color: Colors.error, fontSize: 15, fontWeight: '500' },
  fullBanner: { backgroundColor: Colors.gray100, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  fullBannerText: { fontSize: 15, color: Colors.gray600 },
})

import { useState, useCallback } from 'react'
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Image, Platform, KeyboardAvoidingView
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { router } from 'expo-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../src/services/api'
import { useAppStore } from '../../src/store/app.store'
import { Colors, Spacing, Typography, CommonStyles } from '../../src/styles/theme'
import { DietaryRestriction, DIETARY_LABELS, DIETARY_EMOJIS } from '@round/shared'

const CUISINE_TYPES = [
  'American', 'Mexican', 'Italian', 'Asian', 'Japanese', 'Indian',
  'Mediterranean', 'Thai', 'Chinese', 'Middle Eastern', 'African', 'Other'
]

const ALL_DIETARY: DietaryRestriction[] = [
  'VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'DAIRY_FREE', 'NUT_FREE', 'HALAL', 'KOSHER'
]

export default function PostMealScreen() {
  const { circles } = useAppStore()
  const activePod = circles[0]
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [cuisineType, setCuisineType] = useState('')
  const [dietaryTags, setDietaryTags] = useState<DietaryRestriction[]>([])
  const [servings, setServings] = useState('4')
  const [pickupTime, setPickupTime] = useState(() => {
    const d = new Date()
    d.setHours(18, 30, 0, 0)
    return d
  })
  const [pickupLocation, setPickupLocation] = useState('')
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const postMutation = useMutation({
    mutationFn: (data: any) => api.createMeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals', activePod?.id] })
      router.replace('/(tabs)')
      Alert.alert('🍳 Meal posted!', "Your pod has been notified.")
    },
    onError: (err: any) => {
      Alert.alert('Could not post meal', err.message)
    },
  })

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to add a meal photo.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri)
      await uploadToCloudinary(result.assets[0].uri)
    }
  }, [])

  const uploadToCloudinary = async (uri: string) => {
    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', { uri, type: 'image/jpeg', name: 'meal.jpg' } as any)
      formData.append('upload_preset', process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      setPhotoUrl(data.secure_url)
    } catch (err) {
      Alert.alert('Photo upload failed', 'You can still post without a photo.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const toggleDietaryTag = (tag: DietaryRestriction) => {
    setDietaryTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = () => {
    if (!title.trim()) return Alert.alert('Missing info', 'Please add a title for your meal.')
    if (!pickupLocation.trim()) return Alert.alert('Missing info', 'Please add a pickup location.')
    if (!activePod) return Alert.alert('No pod', 'You need to be in a pod to post a meal.')
    if (uploadingPhoto) return Alert.alert('Please wait', 'Photo is still uploading...')

    const cookDate = new Date()
    cookDate.setHours(0, 0, 0, 0)

    postMutation.mutate({
      circleId: activePod.id,
      title: title.trim(),
      description: description.trim() || undefined,
      photo: photoUrl,
      cuisineType: cuisineType || undefined,
      dietaryTags,
      servingsAvailable: parseInt(servings, 10) || 4,
      pickupTime: pickupTime.toISOString(),
      pickupLocation: pickupLocation.trim(),
      cookDate: cookDate.toISOString(),
    })
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.brown} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post a meal</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Photo */}
        <TouchableOpacity style={styles.photoArea} onPress={pickImage}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={32} color={Colors.gray400} />
              <Text style={styles.photoHint}>Add a photo (optional)</Text>
            </View>
          )}
          {uploadingPhoto && (
            <View style={styles.uploadingOverlay}>
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.field}>
          <Text style={CommonStyles.label}>What are you making? *</Text>
          <TextInput
            style={CommonStyles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Mom's Chicken Enchiladas"
            placeholderTextColor={Colors.gray400}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={CommonStyles.label}>Description</Text>
          <TextInput
            style={[CommonStyles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Ingredients, spice level, what makes it special..."
            placeholderTextColor={Colors.gray400}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Cuisine */}
        <View style={styles.field}>
          <Text style={CommonStyles.label}>Cuisine type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
            {CUISINE_TYPES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.pill, cuisineType === c && styles.pillActive]}
                onPress={() => setCuisineType(cuisineType === c ? '' : c)}
              >
                <Text style={[styles.pillText, cuisineType === c && styles.pillTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Dietary tags */}
        <View style={styles.field}>
          <Text style={CommonStyles.label}>This meal is...</Text>
          <View style={styles.tagGrid}>
            {ALL_DIETARY.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.dietaryTag, dietaryTags.includes(tag) && styles.dietaryTagActive]}
                onPress={() => toggleDietaryTag(tag)}
              >
                <Text style={styles.dietaryEmoji}>{DIETARY_EMOJIS[tag]}</Text>
                <Text style={[styles.dietaryLabel, dietaryTags.includes(tag) && styles.dietaryLabelActive]}>
                  {DIETARY_LABELS[tag]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Servings */}
        <View style={styles.field}>
          <Text style={CommonStyles.label}>Servings available *</Text>
          <View style={styles.servingsRow}>
            {['2', '3', '4', '5', '6', '8'].map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.servingButton, servings === n && styles.servingButtonActive]}
                onPress={() => setServings(n)}
              >
                <Text style={[styles.servingText, servings === n && styles.servingTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pickup time */}
        <View style={styles.field}>
          <Text style={CommonStyles.label}>Pickup time *</Text>
          <TouchableOpacity
            style={[CommonStyles.input, styles.timeButton]}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time-outline" size={18} color={Colors.brownLight} />
            <Text style={styles.timeText}>
              {pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={pickupTime}
              mode="time"
              onChange={(_, date) => { setShowTimePicker(false); if (date) setPickupTime(date) }}
            />
          )}
        </View>

        {/* Pickup location */}
        <View style={styles.field}>
          <Text style={CommonStyles.label}>Pickup location *</Text>
          <TextInput
            style={CommonStyles.input}
            value={pickupLocation}
            onChangeText={setPickupLocation}
            placeholder="e.g. Front porch, 123 Main St"
            placeholderTextColor={Colors.gray400}
            maxLength={200}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[CommonStyles.primaryButton, postMutation.isPending && styles.disabled, { marginTop: Spacing.lg }]}
          onPress={handleSubmit}
          disabled={postMutation.isPending}
        >
          <Text style={CommonStyles.primaryButtonText}>
            {postMutation.isPending ? 'Posting...' : '🍳 Post meal to pod'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.creamLight },
  content: { padding: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg, paddingTop: 48 },
  headerTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.brown },
  photoArea: { borderRadius: 16, overflow: 'hidden', marginBottom: Spacing.lg, backgroundColor: Colors.gray100, height: 200 },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  photoHint: { fontSize: Typography.sizes.sm, color: Colors.gray400 },
  uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  uploadingText: { color: Colors.white, fontWeight: '600' },
  field: { marginBottom: Spacing.lg },
  textArea: { height: 88, paddingTop: Spacing.sm, textAlignVertical: 'top' },
  pillScroll: { marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.gray300, marginRight: Spacing.sm, backgroundColor: Colors.white },
  pillActive: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  pillText: { fontSize: Typography.sizes.sm, color: Colors.brownLight, fontWeight: '500' },
  pillTextActive: { color: Colors.white },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  dietaryTag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.gray300, backgroundColor: Colors.white },
  dietaryTagActive: { backgroundColor: Colors.green + '20', borderColor: Colors.green },
  dietaryEmoji: { fontSize: 14 },
  dietaryLabel: { fontSize: Typography.sizes.sm, color: Colors.brownLight },
  dietaryLabelActive: { color: Colors.green, fontWeight: '600' },
  servingsRow: { flexDirection: 'row', gap: Spacing.sm },
  servingButton: { width: 48, height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.gray300, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  servingButtonActive: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  servingText: { fontSize: Typography.sizes.md, fontWeight: '600', color: Colors.brownLight },
  servingTextActive: { color: Colors.white },
  timeButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  timeText: { fontSize: Typography.sizes.base, color: Colors.brown },
  disabled: { opacity: 0.6 },
})

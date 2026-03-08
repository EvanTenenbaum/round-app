import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Switch, ActivityIndicator, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { api } from '../../src/services/api'
import { useAppStore } from '../../src/store/app.store'
import { Colors } from '../../src/styles/theme'

const STEPS = ['About you', 'Location', 'Dietary', 'Cooking']

const DIETARY_OPTIONS = [
  { value: 'VEGETARIAN', label: 'Vegetarian' },
  { value: 'VEGAN', label: 'Vegan' },
  { value: 'GLUTEN_FREE', label: 'Gluten-free' },
  { value: 'DAIRY_FREE', label: 'Dairy-free' },
  { value: 'NUT_FREE', label: 'Nut-free' },
  { value: 'HALAL', label: 'Halal' },
  { value: 'KOSHER', label: 'Kosher' },
]

const COOKING_STYLES = [
  'Italian', 'Mexican', 'Asian', 'Japanese', 'Indian', 'Mediterranean',
  'American', 'African', 'Middle Eastern', 'Comfort', 'Healthy', 'Vegan',
]

const SKILL_LABELS = ['', 'Beginner', 'Learning', 'Home cook', 'Confident', 'Passionate']

export default function OnboardingScreen() {
  const router = useRouter()
  const { user, setUser } = useAppStore()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Step 0 — About
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')

  // Step 1 — Location
  const [neighborhoodName, setNeighborhoodName] = useState('')
  const [city, setCity] = useState('')
  const [locationGranted, setLocationGranted] = useState(false)

  // Step 2 — Dietary
  const [dietary, setDietary] = useState<string[]>([])
  const [allergenNotes, setAllergenNotes] = useState('')

  // Step 3 — Cooking
  const [cookingStyles, setCookingStyles] = useState<string[]>([])
  const [skillLevel, setSkillLevel] = useState(3)
  const [containerPolicy, setContainerPolicy] = useState('I provide containers — keep them, no return needed')

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return
    const loc = await Location.getCurrentPositionAsync({})
    const [geo] = await Location.reverseGeocodeAsync(loc.coords)
    if (geo.city) setCity(geo.city)
    if (geo.subregion || geo.district) setNeighborhoodName(geo.subregion || geo.district || '')
    setLocationGranted(true)
  }

  const toggleDiet = (v: string) => {
    setDietary(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])
  }

  const toggleStyle = (v: string) => {
    setCookingStyles(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])
  }

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => s - 1)

  const finish = async () => {
    setSaving(true)
    try {
      const updated = await api.updateMe({
        name,
        bio,
        neighborhoodName,
        city,
        dietaryRestrictions: dietary as any,
        allergenNotes,
        cookingStyles,
        cookingSkillLevel: skillLevel,
        containerPolicy,
        onboardingComplete: true,
      })
      setUser(updated)
      router.replace('/(tabs)')
    } catch (e: any) {
      Alert.alert('Error saving profile', e.message)
      setSaving(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressRow}>
        {STEPS.map((s, i) => (
          <View key={s} style={[styles.progressStep, i <= step && styles.progressStepActive]} />
        ))}
      </View>
      <Text style={styles.stepLabel}>{STEPS[step]}</Text>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Step 0: About */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.heading}>Welcome to Round</Text>
            <Text style={styles.subheading}>
              Tell your neighbors a little about yourself.
            </Text>
            <Text style={styles.label}>Your name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoFocus
            />
            <Text style={styles.label}>Bio (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="What do you love to cook? Any fun facts?"
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.heading}>Where are you?</Text>
            <Text style={styles.subheading}>
              Used to find circles near you. Never shared publicly beyond your neighborhood.
            </Text>
            <TouchableOpacity
              style={[styles.locationBtn, locationGranted && styles.locationBtnGranted]}
              onPress={requestLocation}
            >
              <Ionicons
                name={locationGranted ? 'checkmark-circle' : 'location-outline'}
                size={20}
                color={locationGranted ? Colors.green : Colors.orange}
              />
              <Text style={[styles.locationBtnText, locationGranted && { color: Colors.green }]}>
                {locationGranted ? 'Location detected' : 'Use my location'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.label}>Neighborhood</Text>
            <TextInput
              style={styles.input}
              value={neighborhoodName}
              onChangeText={setNeighborhoodName}
              placeholder="Mission District, Park Slope…"
            />
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="San Francisco"
            />
          </View>
        )}

        {/* Step 2: Dietary */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.heading}>Dietary restrictions</Text>
            <Text style={styles.subheading}>
              Your circle will see these so they can cook for you safely. Be accurate — especially for allergies.
            </Text>
            <View style={styles.chipRow}>
              {DIETARY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, dietary.includes(opt.value) && styles.chipActive]}
                  onPress={() => toggleDiet(opt.value)}
                >
                  <Text style={[styles.chipText, dietary.includes(opt.value) && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Allergen notes (optional but important)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={allergenNotes}
              onChangeText={setAllergenNotes}
              placeholder="e.g. Severe tree nut allergy — EpiPen on hand. Please confirm nut-free."
              multiline
              numberOfLines={3}
            />
            <View style={styles.allergenNote}>
              <Ionicons name="warning-outline" size={14} color={Colors.amber} />
              <Text style={styles.allergenNoteText}>
                Allergen info is shared with your entire circle. If you have a serious allergy, describe it clearly here.
              </Text>
            </View>
          </View>
        )}

        {/* Step 3: Cooking */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.heading}>Your cooking</Text>
            <Text style={styles.subheading}>
              Helps your circle know what kind of meals to expect from you.
            </Text>
            <Text style={styles.label}>Cooking styles</Text>
            <View style={styles.chipRow}>
              {COOKING_STYLES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, cookingStyles.includes(s) && styles.chipActive]}
                  onPress={() => toggleStyle(s)}
                >
                  <Text style={[styles.chipText, cookingStyles.includes(s) && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Skill level</Text>
            <View style={styles.skillRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.skillBtn, skillLevel === n && styles.skillBtnActive]}
                  onPress={() => setSkillLevel(n)}
                >
                  <Text style={[styles.skillBtnText, skillLevel === n && styles.skillBtnTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.skillLabel}>{SKILL_LABELS[skillLevel]}</Text>
            <Text style={styles.label}>Container policy</Text>
            <Text style={styles.helperText}>
              Set expectations for your circle on how containers work for your meals.
            </Text>
            {[
              'I provide containers — keep them, no return needed',
              'Please bring your own containers',
              "I'll have containers, but returns appreciated",
            ].map(policy => (
              <TouchableOpacity
                key={policy}
                style={[styles.policyOption, containerPolicy === policy && styles.policyOptionActive]}
                onPress={() => setContainerPolicy(policy)}
              >
                <View style={[styles.radioOuter, containerPolicy === policy && styles.radioOuterActive]}>
                  {containerPolicy === policy && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.policyText}>{policy}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.nav}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={back}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        {step < STEPS.length - 1 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !name && step === 0 && styles.nextBtnDisabled]}
            onPress={next}
            disabled={!name && step === 0}
          >
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={finish}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.nextBtnText}>Get started</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  progressRow: { flexDirection: 'row', gap: 6, margin: 20, marginTop: 60 },
  progressStep: { flex: 1, height: 4, backgroundColor: Colors.gray200, borderRadius: 2 },
  progressStepActive: { backgroundColor: Colors.orange },
  stepLabel: { fontSize: 12, fontWeight: '600', color: Colors.orange, textTransform: 'uppercase', letterSpacing: 0.5, marginHorizontal: 20, marginBottom: 4 },
  scroll: { flex: 1 },
  stepContent: { padding: 20, paddingTop: 8 },
  heading: { fontSize: 26, fontWeight: '700', color: Colors.gray900, marginBottom: 8 },
  subheading: { fontSize: 15, color: Colors.gray600, lineHeight: 22, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.gray600, marginBottom: 6, marginTop: 12 },
  helperText: { fontSize: 13, color: Colors.gray500, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: Colors.gray200, borderRadius: 10, padding: 14, fontSize: 15, backgroundColor: Colors.white, color: Colors.gray900 },
  textArea: { height: 90, textAlignVertical: 'top' },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.orange, borderRadius: 10, padding: 14, marginBottom: 16 },
  locationBtnGranted: { borderColor: Colors.green, backgroundColor: Colors.green + '10' },
  locationBtnText: { fontSize: 15, color: Colors.orange, fontWeight: '500' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: Colors.gray300, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  chipActive: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  chipText: { fontSize: 14, color: Colors.gray700 },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
  allergenNote: { flexDirection: 'row', gap: 6, backgroundColor: Colors.amber + '10', borderRadius: 8, padding: 10, marginTop: 8, alignItems: 'flex-start' },
  allergenNoteText: { flex: 1, fontSize: 12, color: Colors.gray600, lineHeight: 18 },
  skillRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  skillBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.gray200, alignItems: 'center' },
  skillBtnActive: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  skillBtnText: { fontSize: 16, fontWeight: '600', color: Colors.gray500 },
  skillBtnTextActive: { color: Colors.white },
  skillLabel: { fontSize: 13, color: Colors.gray500, textAlign: 'center', marginBottom: 12 },
  policyOption: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: Colors.gray200, marginBottom: 8, backgroundColor: Colors.white },
  policyOptionActive: { borderColor: Colors.orange, backgroundColor: Colors.orange + '08' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.gray300, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: Colors.orange },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.orange },
  policyText: { flex: 1, fontSize: 14, color: Colors.gray700, lineHeight: 20 },
  nav: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: Colors.gray100, backgroundColor: Colors.white },
  backBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.gray200 },
  backBtnText: { fontSize: 15, color: Colors.gray600, fontWeight: '500' },
  nextBtn: { flex: 1, backgroundColor: Colors.orange, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
})

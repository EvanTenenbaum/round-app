import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from 'react-native'
import { useSignIn } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import { Colors, Spacing, Typography, CommonStyles } from '../../src/styles/theme'

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    if (!isLoaded || !email || !password) return
    setLoading(true)
    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(tabs)')
      }
    } catch (err: any) {
      Alert.alert('Sign in failed', err.errors?.[0]?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>🔥</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your Round account</Text>

        <View style={styles.form}>
          <Text style={CommonStyles.label}>Email</Text>
          <TextInput
            style={CommonStyles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
            placeholderTextColor={Colors.gray400}
          />

          <Text style={[CommonStyles.label, { marginTop: Spacing.md }]}>Password</Text>
          <TextInput
            style={CommonStyles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            placeholder="••••••••"
            placeholderTextColor={Colors.gray400}
          />

          <TouchableOpacity
            style={[CommonStyles.primaryButton, { marginTop: Spacing.xl }, loading && styles.disabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={CommonStyles.primaryButtonText}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text style={{ color: Colors.orange, fontWeight: '600' }}>Sign up free</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.creamLight },
  content: { flex: 1, justifyContent: 'center', padding: Spacing.xl },
  logo: { fontSize: 56, textAlign: 'center', marginBottom: Spacing.md },
  title: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.extrabold, color: Colors.brown, textAlign: 'center' },
  subtitle: { fontSize: Typography.sizes.base, color: Colors.brownLight, textAlign: 'center', marginTop: Spacing.xs, marginBottom: Spacing['2xl'] },
  form: { gap: 0 },
  disabled: { opacity: 0.6 },
  footer: { marginTop: Spacing.xl, alignItems: 'center' },
  footerText: { fontSize: Typography.sizes.sm, color: Colors.brownLight },
})

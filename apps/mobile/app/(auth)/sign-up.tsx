import { SignUp } from '@clerk/clerk-expo'
import { View, StyleSheet } from 'react-native'
import { Colors } from '../../src/styles/theme'

export default function SignUpScreen() {
  return (
    <View style={styles.container}>
      <SignUp redirectUrl="/onboarding" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, justifyContent: 'center' },
})

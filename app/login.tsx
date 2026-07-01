import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 200);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.wrapper}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Welcome back
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Enter your email and password to sign in, or choose Sign up to create a new account.
        </ThemedText>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#8b98a6"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#8b98a6"
          secureTextEntry
          style={styles.input}
        />

        <Pressable
          disabled={loading}
          onPress={handleLogin}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <ThemedText type="subtitle" style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Log in'}
          </ThemedText>
        </Pressable>

        <View style={styles.footerRow}>
          <ThemedText>New here? </ThemedText>
          <Link href="/signup" style={styles.linkButton}>
            <ThemedText type="link">Sign up</ThemedText>
          </Link>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#8b98a6',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#ffffff',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  linkButton: {
    paddingVertical: 4,
  },
});
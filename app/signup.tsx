import { supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      setLoading(false);

      if (error) {
        Alert.alert('Signup failed', error.message);
        return;
      }

      // If Supabase successfully processes it:
      Alert.alert(
        'Success',
        'Account created! Please check your email (if confirmation is enabled).'
      );
      router.replace('/(tabs)');

    } catch (err: any) {
      setLoading(false);
      Alert.alert('Unexpected Error', err.message || 'An error occurred.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.wrapper}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Create account
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Enter your details below to get started with LostFound.
        </ThemedText>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor="#8b98a6"
          style={styles.input}
        />
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
          onPress={handleSignup}
          disabled={loading}
          style={({ pressed }) => [styles.button, (pressed || loading) && styles.buttonPressed]}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText type="subtitle" style={styles.buttonText}>
              Sign up
            </ThemedText>
          )}
        </Pressable>

        <View style={styles.footerRow}>
          <ThemedText>Already have an account? </ThemedText>
          <Link href="/login" style={styles.linkButton}>
            <ThemedText type="link">Log in</ThemedText>
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
    minHeight: 56,
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
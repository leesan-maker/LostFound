import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LandingScreen() {
  return (
    <ThemedView style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconBox} />
          <View style={styles.iconLine} />
          <View style={styles.iconLineSmall} />
        </View>
        <ThemedText type="title" style={styles.title}>
          Lost & Found
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Report and find lost items at school
        </ThemedText>

        <Link href="/login" style={styles.primaryButton}>
          <ThemedText type="subtitle" style={styles.primaryButtonText}>
            Log in
          </ThemedText>
        </Link>
        <Link href="/signup" style={styles.secondaryButton}>
          <ThemedText type="subtitle" style={styles.secondaryButtonText}>
            Sign up
          </ThemedText>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    gap: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#F3F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  iconLine: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0F172A',
  },
  iconLineSmall: {
    width: 18,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0F172A',
  },
  title: {
    textAlign: 'center',
    color: '#0F172A',
  },
  subtitle: {
    lineHeight: 22,
    color: '#475569',

  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    height: 50,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    paddingLeft: 152,
  },
  secondaryButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    height: 50,
    
  },
  secondaryButtonText: {
    color: '#0F172A',
    textAlign: 'center',
    fontSize: 16,
    paddingLeft: 147,
  },
});

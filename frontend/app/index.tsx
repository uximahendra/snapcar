import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { colors, typography, spacing } from '../constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Brand */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>📸</Text>
          </View>
          <Text style={styles.brandName}>Snap Your Car</Text>
          <Text style={styles.tagline}>Make your car photos showroom-ready in one tap</Text>
        </View>

        {/* CTAs */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/login?demo=true')}
          >
            <Text style={styles.secondaryButtonText}>Try Demo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 120,
    paddingBottom: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 48,
  },
  brandName: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.body,
    color: colors.mutedGray,
    textAlign: 'center',
    maxWidth: 300,
  },
  ctaContainer: {
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 5,
  },
  primaryButtonText: {
    ...typography.h3,
    color: colors.white,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primaryBlue,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.h3,
    color: colors.primaryBlue,
  },
  loadingText: {
    ...typography.body,
    color: colors.white,
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useCaptureStore } from '../../store/captureStore';
import { sessionAPI } from '../../utils/api';
import { colors, typography, spacing } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setSession } = useCaptureStore();
  const [loading, setLoading] = useState(false);

  const handleModeSelect = async (mode: 'exterior' | 'interior') => {
    try {
      setLoading(true);
      
      // Generate session title
      const timestamp = new Date().toISOString().split('T')[0];
      const title = `${mode.toUpperCase()}-${timestamp}`;
      
      // Create session
      const session = await sessionAPI.createSession(title, mode);
      
      // Set in capture store
      setSession(session.id, mode);
      
      // Navigate to mode selection
      router.push('/capture/mode');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to create session');
      console.error('Create session error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi {user?.name?.split(' ')[0] || 'there'} 👋</Text>
            <Text style={styles.subtitle}>Ready to capture amazing car photos?</Text>
          </View>
          
          {user?.subscription && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Lifetime Access</Text>
            </View>
          )}
        </View>

        {/* Main Action Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start New Session</Text>
          
          <View style={styles.actionCards}>
            <TouchableOpacity
              style={[styles.actionCard, styles.exteriorCard]}
              onPress={() => handleModeSelect('exterior')}
              disabled={loading}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="car-sport" size={48} color={colors.white} />
              </View>
              <Text style={styles.cardTitle}>EXTERIOR</Text>
              <Text style={styles.cardSubtitle}>7 Angles</Text>
              <View style={styles.cardAngles}>
                <Text style={styles.angleText}>Front • Sides • Rear • Diagonals</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.interiorCard]}
              onPress={() => handleModeSelect('interior')}
              disabled={loading}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="car" size={48} color={colors.white} />
              </View>
              <Text style={styles.cardTitle}>INTERIOR</Text>
              <Text style={styles.cardSubtitle}>5 Angles</Text>
              <View style={styles.cardAngles}>
                <Text style={styles.angleText}>Dashboard • Seats • Trunk</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Ionicons name="sunny" size={20} color={colors.secondaryTeal} />
              <Text style={styles.tipText}>Capture in good natural lighting</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="resize" size={20} color={colors.secondaryTeal} />
              <Text style={styles.tipText}>Keep 2-3 meters distance</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="grid" size={20} color={colors.secondaryTeal} />
              <Text style={styles.tipText}>Follow ghost overlay guides</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.mutedGray,
  },
  badge: {
    backgroundColor: colors.secondaryTeal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  actionCards: {
    gap: spacing.sm,
  },
  actionCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.md,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  exteriorCard: {
    backgroundColor: colors.primaryBlue,
  },
  interiorCard: {
    backgroundColor: colors.secondaryTeal,
  },
  cardIcon: {
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xs,
  },
  cardAngles: {
    marginTop: spacing.xs,
  },
  angleText: {
    ...typography.small,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tipText: {
    ...typography.body,
    color: colors.mutedGray,
    flex: 1,
  },
});
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCaptureStore } from '../../store/captureStore';
import { VEHICLE_ANGLES, colors, typography, spacing } from '../../constants/theme';

export default function ModeSelectionScreen() {
  const router = useRouter();
  const { currentMode, setSelectedAngle } = useCaptureStore();

  const angles = currentMode ? VEHICLE_ANGLES[currentMode] : [];

  const handleAngleSelect = (angleId: string) => {
    setSelectedAngle(angleId);
    router.push('/capture/camera');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {currentMode === 'exterior' ? 'Exterior' : 'Interior'} Angles
          </Text>
          <Text style={styles.subtitle}>Select an angle to capture</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.angleGrid}>
          {angles.map((angle) => (
            <TouchableOpacity
              key={angle.id}
              style={styles.angleCard}
              onPress={() => handleAngleSelect(angle.id)}
            >
              <View style={styles.angleIcon}>
                <Ionicons name={angle.icon as any} size={40} color={colors.primaryBlue} />
              </View>
              <Text style={styles.angleLabel}>{angle.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Capture Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.secondaryTeal} />
              <Text style={styles.tipText}>Keep 2-3 meters distance from vehicle</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.secondaryTeal} />
              <Text style={styles.tipText}>Use natural daylight when possible</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.secondaryTeal} />
              <Text style={styles.tipText}>Follow ghost overlay for alignment</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.white,
  },
  subtitle: {
    ...typography.body,
    color: colors.mutedGray,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  angleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  angleCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  angleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(23, 160, 240, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  angleLabel: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: 'rgba(18, 179, 166, 0.1)',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondaryTeal,
  },
  tipsTitle: {
    ...typography.h3,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  tipsList: {
    gap: spacing.xs,
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
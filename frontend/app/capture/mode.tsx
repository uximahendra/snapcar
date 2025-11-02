import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  StatusBar,
  Platform,
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

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.angleList}>
          {angles.map((angle) => (
            <TouchableOpacity
              key={angle.id}
              style={styles.angleCard}
              onPress={() => handleAngleSelect(angle.id)}
              activeOpacity={0.7}
            >
              {/* Image Container */}
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: angle.image }} 
                  style={styles.angleImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay} />
              </View>

              {/* Content Container */}
              <View style={styles.contentContainer}>
                <View style={styles.angleInfo}>
                  <Text style={styles.angleLabel}>{angle.label}</Text>
                  <Text style={styles.angleDescription}>{angle.description}</Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Ionicons name="chevron-forward" size={24} color={colors.primaryBlue} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={colors.secondaryTeal} />
            <Text style={styles.tipsTitle}>Capture Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.secondaryTeal} />
              <Text style={styles.tipText}>Keep 2-3 meters distance from vehicle</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.secondaryTeal} />
              <Text style={styles.tipText}>Use natural daylight when possible</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.secondaryTeal} />
              <Text style={styles.tipText}>Follow the overlay guide for alignment</Text>
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
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  angleList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  angleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    flexDirection: 'row',
    height: 100,
  },
  imageContainer: {
    width: 120,
    height: '100%',
    position: 'relative',
  },
  angleImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  angleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  angleLabel: {
    ...typography.h3,
    color: colors.white,
    marginBottom: 4,
  },
  angleDescription: {
    ...typography.small,
    color: colors.mutedGray,
    lineHeight: 16,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(23, 160, 240, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsCard: {
    backgroundColor: 'rgba(18, 179, 166, 0.1)',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondaryTeal,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tipsTitle: {
    ...typography.h3,
    color: colors.white,
  },
  tipsList: {
    gap: spacing.xs,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  tipText: {
    ...typography.body,
    color: colors.mutedGray,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCaptureStore } from '../../store/captureStore';
import { colors, typography, spacing } from '../../constants/theme';

export default function PreviewScreen() {
  const router = useRouter();
  const { capturedImages } = useCaptureStore();

  const lastImage = capturedImages[capturedImages.length - 1];

  const handleEnhance = () => {
    router.push('/preview/processing');
  };

  const handleRetake = () => {
    router.back();
  };

  const handleCaptureMore = () => {
    router.push('/capture/mode');
  };

  if (!lastImage) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No image captured</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="close" size={28} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: lastImage.uri }} style={styles.image} />
          <View style={styles.angleLabel}>
            <Text style={styles.angleLabelText}>{lastImage.angle}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.infoCard}>
            <Ionicons name="images" size={24} color={colors.primaryBlue} />
            <View>
              <Text style={styles.infoLabel}>Images Captured</Text>
              <Text style={styles.infoValue}>{capturedImages.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.enhanceButton} onPress={handleEnhance}>
            <Ionicons name="sparkles" size={20} color={colors.white} />
            <Text style={styles.enhanceButtonText}>Enhance Now</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleRetake}>
              <Ionicons name="camera" size={20} color={colors.primaryBlue} />
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleCaptureMore}>
              <Ionicons name="add" size={20} color={colors.primaryBlue} />
              <Text style={styles.secondaryButtonText}>More Angles</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  angleLabel: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  angleLabelText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
  info: {
    marginBottom: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    ...typography.small,
    color: colors.mutedGray,
  },
  infoValue: {
    ...typography.h3,
    color: colors.white,
  },
  actions: {
    gap: spacing.sm,
  },
  enhanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryBlue,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 5,
  },
  enhanceButtonText: {
    ...typography.h3,
    color: colors.white,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primaryBlue,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.primaryBlue,
    fontWeight: '600',
  },
  errorText: {
    ...typography.body,
    color: colors.white,
  },
});
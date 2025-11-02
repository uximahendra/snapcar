import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCaptureStore } from '../../store/captureStore';
import { sessionAPI } from '../../utils/api';
import { BACKGROUNDS, colors, typography, spacing } from '../../constants/theme';

export default function ResultScreen() {
  const router = useRouter();
  const { capturedImages, currentSessionId, clearCapture } = useCaptureStore();
  const [selectedBackground, setSelectedBackground] = useState('studio_white');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [watermark, setWatermark] = useState(true);
  const [saving, setSaving] = useState(false);

  const lastImage = capturedImages[capturedImages.length - 1];

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // In production, update session with enhanced images
      if (currentSessionId) {
        await sessionAPI.updateSession(currentSessionId, {
          images: capturedImages.map((img) => ({
            id: img.id,
            angle: img.angle,
            status: 'processed',
            before_base64: img.uri,
            after_base64: img.uri, // Mock - same as before for demo
            background: selectedBackground,
            watermark,
            mask_confidence: 98.5,
            created_at: new Date().toISOString(),
          })),
        });
      }

      Alert.alert(
        'Success',
        'Image saved to My Cars!',
        [
          {
            text: 'View Gallery',
            onPress: () => {
              clearCapture();
              router.replace('/(tabs)/gallery');
            },
          },
          {
            text: 'Continue',
            onPress: () => {
              clearCapture();
              router.replace('/(tabs)/home');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save image');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    Alert.alert('Download', 'Download functionality will be implemented');
  };

  if (!lastImage) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No image to preview</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/home')}
            style={styles.headerButton}
          >
            <Ionicons name="close" size={28} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Before / After</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Before/After Slider */}
        <View style={styles.sliderContainer}>
          <View style={styles.imageWrapper}>
            {/* Before Image (left side) */}
            <View style={[styles.imageHalf, { width: `${sliderPosition}%` }]}>
              <Image source={{ uri: lastImage.uri }} style={styles.image} />
              <View style={styles.label}>
                <Text style={styles.labelText}>Before</Text>
              </View>
            </View>

            {/* After Image (right side) */}
            <View style={[styles.imageHalf, { width: `${100 - sliderPosition}%`, right: 0, position: 'absolute' }]}>
              <Image source={{ uri: lastImage.uri }} style={styles.image} />
              <View style={styles.label}>
                <Text style={styles.labelText}>After</Text>
              </View>
            </View>

            {/* Slider Handle */}
            <View
              style={[styles.sliderHandle, { left: `${sliderPosition}%` }]}
            >
              <View style={styles.sliderLine} />
              <View style={styles.sliderCircle}>
                <Ionicons name="swap-horizontal" size={20} color={colors.white} />
              </View>
            </View>
          </View>

          {/* Slider Control */}
          <View style={styles.sliderControls}>
            <TouchableOpacity
              onPress={() => setSliderPosition(Math.max(0, sliderPosition - 10))}
              style={styles.sliderButton}
            >
              <Ionicons name="chevron-back" size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSliderPosition(Math.min(100, sliderPosition + 10))}
              style={styles.sliderButton}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Background Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Background</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.backgroundList}>
              {BACKGROUNDS.map((bg) => (
                <TouchableOpacity
                  key={bg.id}
                  style={[
                    styles.backgroundItem,
                    selectedBackground === bg.id && styles.backgroundItemActive,
                  ]}
                  onPress={() => setSelectedBackground(bg.id)}
                >
                  <View style={[styles.backgroundPreview, { backgroundColor: bg.preview }]} />
                  <Text style={styles.backgroundLabel}>{bg.label}</Text>
                  {selectedBackground === bg.id && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Watermark Toggle */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.toggleItem}
            onPress={() => setWatermark(!watermark)}
          >
            <View style={styles.toggleLeft}>
              <Ionicons name="water" size={24} color={colors.primaryBlue} />
              <Text style={styles.toggleLabel}>Watermark</Text>
            </View>
            <View style={[styles.toggle, watermark && styles.toggleActive]}>              <View style={[styles.toggleThumb, watermark && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Metadata */}
        <View style={styles.section}>
          <View style={styles.metadataCard}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Angle</Text>
              <Text style={styles.metadataValue}>{lastImage.angle}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Confidence</Text>
              <Text style={styles.metadataValue}>98.5%</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Time</Text>
              <Text style={styles.metadataValue}>8.2s</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSave}
            disabled={saving}
          >
            <Ionicons name="save" size={20} color={colors.white} />
            <Text style={styles.primaryButtonText}>
              {saving ? 'Saving...' : 'Save to Gallery'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleDownload}>
              <Ionicons name="download" size={20} color={colors.primaryBlue} />
              <Text style={styles.secondaryButtonText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="share" size={20} color={colors.primaryBlue} />
              <Text style={styles.secondaryButtonText}>Share</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
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
  sliderContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  imageWrapper: {
    height: 300,
    backgroundColor: '#000',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  imageHalf: {
    height: '100%',
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  label: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  labelText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
  sliderHandle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    marginLeft: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderLine: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: colors.white,
  },
  sliderCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  sliderControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  backgroundList: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  backgroundItem: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  backgroundItemActive: {
    borderColor: colors.primaryBlue,
  },
  backgroundPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backgroundLabel: {
    ...typography.small,
    color: colors.mutedGray,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleLabel: {
    ...typography.body,
    color: colors.white,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.primaryBlue,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  metadataCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metadataItem: {
    alignItems: 'center',
  },
  metadataLabel: {
    ...typography.small,
    color: colors.mutedGray,
    marginBottom: 4,
  },
  metadataValue: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  actions: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  primaryButton: {
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
  primaryButtonText: {
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
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useCaptureStore } from '../../store/captureStore';
import { colors, typography, spacing } from '../../constants/theme';

export default function CameraScreen() {
  const router = useRouter();
  const { selectedAngle, addCapturedImage, currentSessionId } = useCaptureStore();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    setIsWeb(Platform.OS === 'web');
    // On web, show helper message
    if (Platform.OS === 'web') {
      setTimeout(() => {
        Alert.alert(
          'Camera on Web',
          'Camera functionality is limited on web browsers. Please use the gallery picker or test on a mobile device with Expo Go for full camera support.',
          [{ text: 'OK' }]
        );
      }, 500);
    }
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required. Please use the gallery picker instead or grant camera permissions in your device settings.'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const handleCapture = async () => {
    try {
      setLoading(true);
      
      // Check if camera is available
      const cameraAvailable = await ImagePicker.getCameraPermissionsAsync();
      
      if (Platform.OS === 'web') {
        Alert.alert(
          'Use Gallery Instead',
          'Camera is not fully supported in web browsers. Please use the gallery picker button to select an image.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images' as any,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setCapturedImage(imageUri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(
        'Camera Error',
        'Failed to open camera. Please use the gallery picker instead.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    console.log('🖼️ Gallery button clicked!');
    try {
      setLoading(true);
      console.log('🖼️ Launching image library...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: false,
        quality: 0.8,
        base64: false, // Changed to false for web compatibility
      });

      console.log('🖼️ Image picker result:', result);

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('✅ Image selected:', imageUri);
        setCapturedImage(imageUri);
        Alert.alert('Success', 'Image loaded! Tap "Use Photo" to continue.');
      } else {
        console.log('❌ Image selection cancelled');
      }
    } catch (error: any) {
      console.error('❌ Pick image error:', error);
      Alert.alert(
        'Image Selection',
        `Error: ${error.message || 'Failed to pick image'}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUsePhoto = () => {
    if (!capturedImage || !selectedAngle) return;

    // Add to capture store
    addCapturedImage({
      id: Date.now().toString(),
      angle: selectedAngle,
      uri: capturedImage,
    });

    // Navigate to preview
    router.push('/capture/preview');
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedAngle}</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Web Notice Banner */}
      {isWeb && !capturedImage && (
        <View style={styles.webBanner}>
          <Ionicons name="information-circle" size={20} color={colors.primaryBlue} />
          <Text style={styles.webBannerText}>
            Camera limited on web. Tap gallery icon below to select an image.
          </Text>
        </View>
      )}

      {/* Camera View */}
      <View style={styles.cameraView}>
        {capturedImage ? (
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
        ) : (
          <View style={styles.placeholderView}>
            {/* Ghost Overlay */}
            <View style={styles.ghostOverlay}>
              <Ionicons name="car-sport-outline" size={120} color={colors.secondaryTeal} />
            </View>
            <Text style={styles.hintText}>
              {isWeb ? 'Select an image from gallery' : 'Position your vehicle within the guide'}
            </Text>
            <Text style={styles.subHintText}>
              {isWeb ? 'Tap gallery icon below' : 'Hold 2-3m away • Avoid direct sunlight'}
            </Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {capturedImage ? (
          <View style={styles.previewControls}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleRetake}>
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleUsePhoto}>
              <Text style={styles.primaryButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.captureControls}>
            <TouchableOpacity 
              style={[styles.galleryButton, isWeb && styles.galleryButtonHighlight]} 
              onPress={handlePickImage}
            >
              <Ionicons name="images" size={28} color={isWeb ? colors.primaryBlue : colors.white} />
              {isWeb && <Text style={styles.galleryButtonText}>Gallery</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shutterButton}
              onPress={handleCapture}
              disabled={loading || isWeb}
            >
              <View style={[styles.shutterInner, (loading || isWeb) && styles.shutterDisabled]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.flashButton}>
              <Ionicons name="flash-off" size={28} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
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
    paddingTop: 60,
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
  webBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 160, 240, 0.1)',
    borderColor: colors.primaryBlue,
    borderWidth: 1,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    gap: spacing.xs,
  },
  webBannerText: {
    ...typography.small,
    color: colors.white,
    flex: 1,
  },
  cameraView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  placeholderView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  ghostOverlay: {
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.secondaryTeal,
    borderRadius: 20,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  hintText: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subHintText: {
    ...typography.small,
    color: colors.mutedGray,
    textAlign: 'center',
  },
  controls: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  captureControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  galleryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryButtonHighlight: {
    backgroundColor: colors.white,
    width: 80,
    borderWidth: 2,
    borderColor: colors.primaryBlue,
  },
  galleryButtonText: {
    ...typography.small,
    color: colors.primaryBlue,
    fontWeight: '600',
    marginTop: 2,
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.primaryDark,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  shutterDisabled: {
    backgroundColor: colors.mutedGray,
    opacity: 0.5,
  },
  flashButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewControls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primaryBlue,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.h3,
    color: colors.white,
  },
  secondaryButton: {
    flex: 1,
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
});
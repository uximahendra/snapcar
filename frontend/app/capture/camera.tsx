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
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useCaptureStore } from '../../store/captureStore';
import { colors, typography, spacing } from '../../constants/theme';

export default function CameraScreen() {
  const router = useRouter();
  const { selectedAngle, addCapturedImage } = useCaptureStore();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isWeb, setIsWeb] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    setIsWeb(Platform.OS === 'web');
    
    // Request camera permission on mount
    if (Platform.OS !== 'web' && !permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleCapture = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Use Gallery',
        'Camera capture is limited on web. Please use the gallery button to select an image.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }
    }

    try {
      if (cameraRef.current) {
        console.log('📸 Taking photo...');
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        console.log('✅ Photo captured:', photo.uri);
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      console.error('❌ Capture error:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const handlePickImage = async () => {
    console.log('🖼️ Gallery button clicked!');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: false,
        quality: 0.8,
        base64: false,
      });

      console.log('🖼️ Image picker result:', result);

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('✅ Image selected:', imageUri);
        setCapturedImage(imageUri);
      }
    } catch (error: any) {
      console.error('❌ Pick image error:', error);
      Alert.alert('Error', `Failed to pick image: ${error.message}`);
    }
  };

  const handleUsePhoto = () => {
    if (!capturedImage || !selectedAngle) return;

    addCapturedImage({
      id: Date.now().toString(),
      angle: selectedAngle,
      uri: capturedImage,
    });

    router.push('/capture/preview');
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  // If image captured, show preview
  if (capturedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedAngle}</Text>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          <View style={styles.angleLabel}>
            <Text style={styles.angleLabelText}>{selectedAngle}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <View style={styles.previewControls}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleRetake}>
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleUsePhoto}>
              <Text style={styles.primaryButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Camera view with live preview
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
      {isWeb && (
        <View style={styles.webBanner}>
          <Ionicons name="information-circle" size={20} color={colors.primaryBlue} />
          <Text style={styles.webBannerText}>
            Camera limited on web. Tap gallery icon below to select an image.
          </Text>
        </View>
      )}

      {/* Camera Preview or Placeholder */}
      <View style={styles.cameraView}>
        {!isWeb && permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            flash={flash}
          >
            {/* Angle Overlay Frame */}
            <View style={styles.overlayContainer}>
              <View style={styles.ghostOverlay}>
                <Ionicons name="car-sport-outline" size={120} color={colors.secondaryTeal} />
              </View>
              <Text style={styles.hintText}>Position your vehicle within the guide</Text>
              <Text style={styles.subHintText}>Hold 2-3m away • Avoid direct sunlight</Text>
            </View>
          </CameraView>
        ) : (
          <View style={styles.placeholderView}>
            <View style={styles.ghostOverlay}>
              <Ionicons name="car-sport-outline" size={120} color={colors.secondaryTeal} />
            </View>
            <Text style={styles.hintText}>
              {isWeb ? 'Select an image from gallery' : 'Camera permission needed'}
            </Text>
            <Text style={styles.subHintText}>
              {isWeb ? 'Tap gallery icon below' : 'Grant permission to use camera'}
            </Text>
            {!isWeb && !permission?.granted && (
              <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
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
            disabled={isWeb || !permission?.granted}
          >
            <View style={[
              styles.shutterInner, 
              (isWeb || !permission?.granted) && styles.shutterDisabled
            ]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.flashButton}
            onPress={toggleFlash}
            disabled={isWeb || !permission?.granted}
          >
            <Ionicons 
              name={flash === 'on' ? 'flash' : 'flash-off'} 
              size={28} 
              color={isWeb || !permission?.granted ? colors.mutedGray : colors.white} 
            />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: spacing.sm,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(11, 23, 34, 0.8)',
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
    marginTop: 110,
    marginBottom: spacing.sm,
    borderRadius: 12,
    gap: spacing.xs,
    zIndex: 5,
  },
  webBannerText: {
    ...typography.small,
    color: colors.white,
    flex: 1,
  },
  cameraView: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  placeholderView: {
    flex: 1,
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
    backgroundColor: 'rgba(18, 179, 166, 0.1)',
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
  permissionButton: {
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  permissionButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  angleLabel: {
    position: 'absolute',
    top: 70,
    left: spacing.md,
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
  controls: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.primaryDark,
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
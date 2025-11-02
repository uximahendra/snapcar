import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sessionAPI, exportAPI } from '../../utils/api';
import { colors, typography, spacing } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SessionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'360' | 'grid'>('360');
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  
  const pan = useRef(new Animated.Value(0)).current;
  const autoRotateTimer = useRef<any>(null);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
    return () => {
      if (autoRotateTimer.current) {
        clearInterval(autoRotateTimer.current);
      }
    };
  }, [sessionId]);

  useEffect(() => {
    if (isAutoRotating && session?.images && session.images.length > 0) {
      autoRotateTimer.current = setInterval(() => {
        setCurrentAngleIndex((prev) => {
          const next = (prev + 1) % session.images.length;
          return next;
        });
      }, 1500); // Rotate every 1.5 seconds
    } else {
      if (autoRotateTimer.current) {
        clearInterval(autoRotateTimer.current);
      }
    }

    return () => {
      if (autoRotateTimer.current) {
        clearInterval(autoRotateTimer.current);
      }
    };
  }, [isAutoRotating, session]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const data = await sessionAPI.getSession(sessionId);
      setSession(data);
    } catch (error) {
      console.error('Fetch session error:', error);
      Alert.alert('Error', 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const exportJob = await exportAPI.exportSession(sessionId);
      
      // Poll for export status
      const checkStatus = setInterval(async () => {
        const status = await exportAPI.getExportStatus(exportJob.job_id);
        
        if (status.status === 'ready') {
          clearInterval(checkStatus);
          setExporting(false);
          Alert.alert('Success', 'Export ready! Download link: ' + status.download_url);
        }
      }, 2000);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkStatus);
        setExporting(false);
      }, 30000);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export session');
      setExporting(false);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (session?.images && session.images.length > 1) {
          const sensitivity = SCREEN_WIDTH / session.images.length;
          const newIndex = Math.floor(-gestureState.dx / sensitivity);
          const clampedIndex = Math.max(0, Math.min(session.images.length - 1, currentAngleIndex + newIndex));
          setCurrentAngleIndex(clampedIndex);
        }
      },
      onPanResponderRelease: () => {
        // Optional: Add momentum or snap behavior
      },
    })
  ).current;

  const toggleAutoRotate = () => {
    setIsAutoRotating(!isAutoRotating);
  };

  const renderAngleDots = () => {
    if (!session?.images || session.images.length === 0) return null;

    return (
      <View style={styles.dotsContainer}>
        {session.images.map((_: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentAngleIndex && styles.dotActive,
            ]}
            onPress={() => setCurrentAngleIndex(index)}
          />
        ))}
      </View>
    );
  };

  const render360View = () => {
    if (!session?.images || session.images.length === 0) {
      return (
        <View style={styles.emptyView}>
          <Ionicons name="images-outline" size={64} color={colors.mutedGray} />
          <Text style={styles.emptyText}>No images in this session</Text>
        </View>
      );
    }

    const currentImage = session.images[currentAngleIndex];

    return (
      <View style={styles.viewer360Container}>
        {/* 360 Viewer */}
        <View style={styles.viewer360} {...panResponder.panHandlers}>
          <Image
            source={{ uri: currentImage.after_base64 || currentImage.before_base64 }}
            style={styles.viewer360Image}
            resizeMode="contain"
          />
          
          {/* Angle Label */}
          <View style={styles.angleLabelOverlay}>
            <Text style={styles.angleLabelText}>{currentImage.angle}</Text>
            {currentImage.mask_confidence && (
              <Text style={styles.confidenceText}>{currentImage.mask_confidence}% quality</Text>
            )}
          </View>

          {/* Swipe Hint */}
          {!isAutoRotating && (
            <View style={styles.swipeHint}>
              <Ionicons name="swap-horizontal" size={24} color={colors.white} />
              <Text style={styles.swipeHintText}>Swipe to rotate</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.viewerControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setCurrentAngleIndex(Math.max(0, currentAngleIndex - 1))}
            disabled={currentAngleIndex === 0}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={currentAngleIndex === 0 ? colors.mutedGray : colors.white} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isAutoRotating && styles.controlButtonActive]}
            onPress={toggleAutoRotate}
          >
            <Ionicons 
              name={isAutoRotating ? 'pause' : 'play'} 
              size={20} 
              color={colors.white} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setCurrentAngleIndex(Math.min(session.images.length - 1, currentAngleIndex + 1))}
            disabled={currentAngleIndex === session.images.length - 1}
          >
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={currentAngleIndex === session.images.length - 1 ? colors.mutedGray : colors.white} 
            />
          </TouchableOpacity>
        </View>

        {/* Angle Dots */}
        {renderAngleDots()}
      </View>
    );
  };

  const renderGridView = () => {
    if (!session?.images || session.images.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={64} color={colors.mutedGray} />
          <Text style={styles.emptyText}>No images in this session</Text>
        </View>
      );
    }

    return (
      <View style={styles.imageGrid}>
        {session.images.map((image: any) => (
          <View key={image.id} style={styles.imageCard}>
            <View style={styles.imageContainer}>
              {image.after_base64 ? (
                <Image
                  source={{ uri: image.after_base64 }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color={colors.mutedGray} />
                </View>
              )}
              <View style={styles.imageLabel}>
                <Text style={styles.imageLabelText}>{image.angle}</Text>
              </View>
              {image.status === 'processed' && (
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.successGreen} />
                </View>
              )}
            </View>
            {image.mask_confidence && (
              <Text style={styles.confidence}>{image.mask_confidence}% quality</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={styles.loadingText}>Loading session...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Session not found</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{session.title}</Text>
          <Text style={styles.subtitle}>
            {new Date(session.created_at).toLocaleDateString()} • {session.mode}
          </Text>
        </View>
        <TouchableOpacity onPress={handleExport} disabled={exporting}>
          {exporting ? (
            <ActivityIndicator size="small" color={colors.primaryBlue} />
          ) : (
            <Ionicons name="download" size={24} color={colors.primaryBlue} />
          )}
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === '360' && styles.toggleButtonActive]}
          onPress={() => setViewMode('360')}
        >
          <Ionicons name="sync" size={20} color={viewMode === '360' ? colors.white : colors.mutedGray} />
          <Text style={[styles.toggleButtonText, viewMode === '360' && styles.toggleButtonTextActive]}>
            360° View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'grid' && styles.toggleButtonActive]}
          onPress={() => setViewMode('grid')}
        >
          <Ionicons name="grid" size={20} color={viewMode === 'grid' ? colors.white : colors.mutedGray} />
          <Text style={[styles.toggleButtonText, viewMode === 'grid' && styles.toggleButtonTextActive]}>
            Grid View
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {viewMode === '360' ? render360View() : renderGridView()}

        {session.images && session.images.length > 0 && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleExport}
              disabled={exporting}
            >
              <Ionicons name="download" size={20} color={colors.white} />
              <Text style={styles.exportButtonText}>
                {exporting ? 'Exporting...' : 'Export All'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
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
    ...typography.h3,
    color: colors.white,
  },
  subtitle: {
    ...typography.small,
    color: colors.mutedGray,
  },
  viewModeToggle: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: colors.primaryBlue,
  },
  toggleButtonText: {
    ...typography.body,
    color: colors.mutedGray,
    fontSize: 14,
  },
  toggleButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  viewer360Container: {
    marginBottom: spacing.md,
  },
  viewer360: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  viewer360Image: {
    width: '100%',
    height: '100%',
  },
  angleLabelOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  angleLabelText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  confidenceText: {
    ...typography.small,
    color: colors.secondaryTeal,
    marginTop: 2,
  },
  swipeHint: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  swipeHintText: {
    ...typography.small,
    color: colors.white,
  },
  viewerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: colors.primaryBlue,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: colors.primaryBlue,
    width: 24,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  imageCard: {
    width: '48%',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageLabel: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageLabelText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
    fontSize: 10,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidence: {
    ...typography.small,
    color: colors.mutedGray,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.mutedGray,
    marginTop: spacing.sm,
  },
  actionsContainer: {
    marginTop: spacing.md,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryBlue,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  exportButtonText: {
    ...typography.h3,
    color: colors.white,
  },
  primaryButton: {
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  primaryButtonText: {
    ...typography.h3,
    color: colors.white,
  },
  loadingText: {
    ...typography.body,
    color: colors.white,
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.white,
  },
});
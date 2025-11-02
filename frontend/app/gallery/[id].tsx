import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sessionAPI, exportAPI } from '../../utils/api';
import { colors, typography, spacing } from '../../constants/theme';

export default function SessionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {session.images && session.images.length > 0 ? (
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
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color={colors.mutedGray} />
            <Text style={styles.emptyText}>No images in this session</Text>
          </View>
        )}

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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
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
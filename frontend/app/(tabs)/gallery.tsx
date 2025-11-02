import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGalleryStore } from '../../store/galleryStore';
import { sessionAPI } from '../../utils/api';
import { colors, typography, spacing } from '../../constants/theme';

export default function GalleryScreen() {
  const router = useRouter();
  const { sessions, setSessions, setLoading, isLoading, removeSession } = useGalleryStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionAPI.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Fetch sessions error:', error);
      Alert.alert('Error', 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

  const handleDelete = async (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await sessionAPI.deleteSession(sessionId);
              removeSession(sessionId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete session');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return colors.successGreen;
      case 'in_queue':
        return colors.warningYellow;
      default:
        return colors.mutedGray;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processed':
        return 'Completed';
      case 'in_queue':
        return 'Processing';
      default:
        return 'Continue';
    }
  };

  const renderSession = ({ item }: any) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => router.push(`/gallery/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardStats}>
          <View style={styles.statItem}>
            <Ionicons name="images" size={16} color={colors.mutedGray} />
            <Text style={styles.statText}>{item.image_count} photos</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name={item.mode === 'exterior' ? 'car-sport' : 'car'}
              size={16}
              color={colors.mutedGray}
            />
            <Text style={styles.statText}>{item.mode}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/gallery/${item.id}`)}
          >
            <Ionicons name="eye" size={20} color={colors.primaryBlue} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash" size={20} color={colors.errorRed} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && sessions.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cars</Text>
        <Text style={styles.subtitle}>{sessions.length} sessions</Text>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={64} color={colors.mutedGray} />
          <Text style={styles.emptyText}>No sessions yet</Text>
          <Text style={styles.emptySubtext}>Create your first car photo session</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.primaryButtonText}>Start Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primaryBlue} />
          }
        />
      )}
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
    padding: spacing.md,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.mutedGray,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.white,
    marginBottom: 4,
  },
  cardDate: {
    ...typography.small,
    color: colors.mutedGray,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...typography.small,
    color: colors.mutedGray,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  emptyText: {
    ...typography.h2,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.mutedGray,
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
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
});
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../utils/api';
import { colors, typography, spacing } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDemoMode = params.demo === 'true';
  
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      handleDemoLogin();
    }
  }, [isDemoMode]);

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const response = await authAPI.demoLogin();
      await login(response.user, response.token);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      await login(response.user, response.token);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={styles.loadingText}>Logging in...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.mutedGray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.mutedGray}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleDemoLogin}
          >
            <Text style={styles.linkButtonText}>Try Demo Mode</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
    paddingTop: 80,
  },
  header: {
    marginBottom: spacing.xl,
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
  form: {
    gap: spacing.md,
  },
  inputContainer: {
    gap: spacing.xs,
  },
  label: {
    ...typography.body,
    color: colors.white,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: spacing.sm,
    ...typography.body,
    color: colors.white,
  },
  primaryButton: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
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
  secondaryButton: {
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
  linkButton: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  linkButtonText: {
    ...typography.body,
    color: colors.secondaryTeal,
  },
  loadingText: {
    ...typography.body,
    color: colors.white,
    marginTop: spacing.sm,
  },
});
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../store/authStore';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const loadAuth = useAuthStore((state) => state.loadAuth);

  useEffect(() => {
    loadAuth();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0B1722' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="capture/mode" options={{ presentation: 'modal' }} />
        <Stack.Screen name="capture/camera" />
        <Stack.Screen name="capture/preview" />
        <Stack.Screen name="preview/processing" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="preview/result" />
        <Stack.Screen name="gallery/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
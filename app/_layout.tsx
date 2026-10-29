import 'react-native-gesture-handler';
import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/core/providers/AppProviders';
import { AuthProvider } from '@/features/auth/providers/AuthProvider';
import { AchievementNotificationsProvider } from '@/features/achievements/providers/AchievementNotificationsProvider';
import {
  AppErrorBoundary,
  TelemetryProvider,
} from '@/core/telemetry/TelemetryProvider';

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <AppProviders>
        <AuthProvider>
          <AchievementNotificationsProvider>
            <TelemetryProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }} />
            </TelemetryProvider>
          </AchievementNotificationsProvider>
        </AuthProvider>
      </AppProviders>
    </AppErrorBoundary>
  );
}

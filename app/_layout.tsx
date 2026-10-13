import 'react-native-gesture-handler';
import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/core/providers/AppProviders';
import {
  AppErrorBoundary,
  TelemetryProvider,
} from '@/core/telemetry/TelemetryProvider';

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <TelemetryProvider>
        <AppProviders>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </AppProviders>
      </TelemetryProvider>
    </AppErrorBoundary>
  );
}

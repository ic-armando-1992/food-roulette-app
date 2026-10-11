import { Component, ErrorInfo, PropsWithChildren, useEffect } from 'react';
import { Text, View } from 'react-native';

import { APP_LABELS } from '@/core/constants/app.labels';
import { TELEMETRY_EVENTS } from '@/core/telemetry/constants/telemetry.constants';
import {
  flushPendingClientErrors,
  reportClientError,
  trackProductEvent,
} from '@/core/telemetry/telemetry';
import {
  AppErrorBoundaryState,
  ErrorUtilsApi,
  GlobalErrorHandler,
} from '@/core/telemetry/types/telemetry.types';

function getErrorUtils(): ErrorUtilsApi | undefined {
  return (globalThis as typeof globalThis & { ErrorUtils?: ErrorUtilsApi })
    .ErrorUtils;
}

export function TelemetryProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    trackProductEvent(TELEMETRY_EVENTS.appOpened, {});
    void flushPendingClientErrors();

    const errorUtils = getErrorUtils();
    const previousHandler = errorUtils?.getGlobalHandler?.();
    const handler: GlobalErrorHandler = (error, isFatal) => {
      reportClientError(error, 'global', { fatal: isFatal ?? false });
      previousHandler?.(error, isFatal);
    };

    errorUtils?.setGlobalHandler?.(handler);

    return () => {
      if (previousHandler) {
        errorUtils?.setGlobalHandler?.(previousHandler);
      }
    };
  }, []);

  return children;
}

export class AppErrorBoundary extends Component<
  PropsWithChildren,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportClientError(error, 'react_error_boundary', {
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-background px-8">
          <Text className="text-center text-2xl font-black text-foreground">
            {APP_LABELS.errorBoundary.title}
          </Text>
          <Text className="mt-3 text-center text-base text-mutedForeground">
            {APP_LABELS.errorBoundary.message}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import {
  AppErrorBoundary,
  TelemetryProvider,
} from '@/core/telemetry/TelemetryProvider';

const mockReportClientError = jest.fn();
const mockTrackProductEvent = jest.fn();
const mockFlushPendingClientErrors = jest.fn().mockResolvedValue(undefined);

jest.mock('@/core/telemetry/telemetry', () => ({
  flushPendingClientErrors: () => mockFlushPendingClientErrors(),
  reportClientError: (...args: unknown[]) => mockReportClientError(...args),
  trackProductEvent: (...args: unknown[]) => mockTrackProductEvent(...args),
}));

describe('TelemetryProvider', () => {
  beforeEach(() => jest.clearAllMocks());

  it('records app open without blocking its children', () => {
    render(
      <TelemetryProvider>
        <Text>Aplicación lista</Text>
      </TelemetryProvider>,
    );

    expect(screen.getByText('Aplicación lista')).toBeOnTheScreen();
    expect(mockTrackProductEvent).toHaveBeenCalledWith('app_opened', {});
    expect(mockFlushPendingClientErrors).toHaveBeenCalledTimes(1);
  });

  it('shows a fallback and reports render errors', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const Broken = () => {
      throw new Error('render failure');
    };

    render(
      <AppErrorBoundary>
        <Broken />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('Algo salió mal')).toBeOnTheScreen();
    await waitFor(() =>
      expect(mockReportClientError).toHaveBeenCalledWith(
        expect.any(Error),
        'react_error_boundary',
        expect.objectContaining({ componentStack: expect.any(String) }),
      ),
    );
    consoleError.mockRestore();
  });
});

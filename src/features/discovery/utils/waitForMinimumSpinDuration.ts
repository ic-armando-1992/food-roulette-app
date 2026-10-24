import { DISCOVERY_TIMING } from '@/features/discovery/constants/discovery.constants';

export function waitForMinimumSpinDuration(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, DISCOVERY_TIMING.minimumSpinDurationMs);
  });
}

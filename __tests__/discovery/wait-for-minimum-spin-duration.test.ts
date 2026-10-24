import { DISCOVERY_TIMING } from '@/features/discovery/constants/discovery.constants';
import { waitForMinimumSpinDuration } from '@/features/discovery/utils/waitForMinimumSpinDuration';

describe('waitForMinimumSpinDuration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps the spin active for the configured minimum duration', async () => {
    const onComplete = jest.fn();

    void waitForMinimumSpinDuration().then(onComplete);

    await jest.advanceTimersByTimeAsync(
      DISCOVERY_TIMING.minimumSpinDurationMs - 1,
    );
    expect(onComplete).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

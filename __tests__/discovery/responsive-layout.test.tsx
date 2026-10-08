import { act, render, screen } from '@testing-library/react-native';
import { Dimensions } from 'react-native';

import { RouletteSpinner } from '@/features/discovery/components/RouletteSpinner';

describe('responsive discovery layout', () => {
  const originalWindow = Dimensions.get('window');
  const originalScreen = Dimensions.get('screen');

  afterEach(() => {
    act(() => {
      Dimensions.set({ screen: originalScreen, window: originalWindow });
    });
  });

  it('keeps the roulette within a 320 dp-wide small Android viewport', () => {
    Dimensions.set({
      screen: { fontScale: 1, height: 568, scale: 1, width: 320 },
      window: { fontScale: 1, height: 568, scale: 1, width: 320 },
    });

    render(<RouletteSpinner spinning={false} />);

    expect(screen.getByLabelText('Ruleta de comida')).toHaveStyle({
      height: 258,
      width: 238,
    });
  });

  it('caps the roulette on a large Android viewport', () => {
    Dimensions.set({
      screen: { fontScale: 1, height: 960, scale: 1, width: 720 },
      window: { fontScale: 1, height: 960, scale: 1, width: 720 },
    });

    render(<RouletteSpinner spinning={false} />);

    expect(screen.getByLabelText('Ruleta de comida')).toHaveStyle({
      height: 340,
      width: 320,
    });
  });
});

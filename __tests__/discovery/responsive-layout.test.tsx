import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';

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

    render(<RouletteSpinner phase="idle" />);

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

    render(<RouletteSpinner phase="idle" />);

    expect(screen.getByLabelText('Ruleta de comida')).toHaveStyle({
      height: 340,
      width: 320,
    });
  });

  it('reports when the final stopping animation completes', () => {
    const onStopped = jest.fn();

    render(<RouletteSpinner onStopped={onStopped} phase="stopping" />);

    expect(onStopped).toHaveBeenCalledTimes(1);
  });

  it('requests a spin when the idle roulette is pressed', () => {
    const onSpinRequest = jest.fn();

    render(<RouletteSpinner onSpinRequest={onSpinRequest} phase="idle" />);
    fireEvent.press(screen.getByRole('button', { name: 'Girar la ruleta' }));

    expect(onSpinRequest).toHaveBeenCalledTimes(1);
  });

  it('does not request a spin when the roulette is disabled', () => {
    const onSpinRequest = jest.fn();

    render(
      <RouletteSpinner disabled onSpinRequest={onSpinRequest} phase="idle" />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Girar la ruleta' }));

    expect(onSpinRequest).not.toHaveBeenCalled();
  });

  it('requests a spin after a deliberate circular drag', () => {
    const onSpinRequest = jest.fn();

    render(<RouletteSpinner onSpinRequest={onSpinRequest} phase="idle" />);
    fireGestureHandler(getByGestureTestId('roulette-circular-gesture'), [
      { x: 300, y: 160 },
      { x: 160, y: 300 },
    ]);

    expect(onSpinRequest).toHaveBeenCalledTimes(1);
  });

  it('ignores a drag through the roulette hub', () => {
    const onSpinRequest = jest.fn();

    render(<RouletteSpinner onSpinRequest={onSpinRequest} phase="idle" />);
    fireGestureHandler(getByGestureTestId('roulette-circular-gesture'), [
      { x: 300, y: 160 },
      { x: 160, y: 160 },
      { x: 160, y: 300 },
    ]);

    expect(onSpinRequest).not.toHaveBeenCalled();
  });
});

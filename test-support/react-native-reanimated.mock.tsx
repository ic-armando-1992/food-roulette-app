import { PropsWithChildren } from 'react';
import { View } from 'react-native';

function AnimatedView({
  children,
  ...props
}: PropsWithChildren<Record<string, unknown>>) {
  return <View {...props}>{children}</View>;
}

const chainableTransition = {
  duration: () => chainableTransition,
};

const Animated = {
  createAnimatedComponent: <T,>(component: T) => component,
  View: AnimatedView,
};

export const Easing = {
  cubic: (value: number) => value,
  linear: (value: number) => value,
  out: <T,>(easing: T) => easing,
};
export const FadeIn = chainableTransition;
export const FadeInDown = chainableTransition;
export const FadeInUp = chainableTransition;
export const FadeOutUp = chainableTransition;
export const LinearTransition = chainableTransition;
export const cancelAnimation = () => undefined;
export const runOnJS = <T extends (...args: never[]) => unknown>(callback: T) =>
  callback;
export const useAnimatedStyle = <T,>(factory: () => T) => factory();
export const useEvent = <T,>(callback: T) => callback;
export const useReducedMotion = () => false;
export const useSharedValue = <T,>(value: T) => ({ value });
export const withRepeat = <T,>(value: T) => value;
export const withTiming = <T,>(
  value: T,
  _config?: unknown,
  callback?: (finished?: boolean) => void,
) => {
  callback?.(true);
  return value;
};

export default Animated;

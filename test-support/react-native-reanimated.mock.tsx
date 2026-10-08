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
  View: AnimatedView,
};

export const Easing = {
  cubic: (value: number) => value,
  out: <T,>(easing: T) => easing,
};
export const FadeIn = chainableTransition;
export const FadeInUp = chainableTransition;
export const cancelAnimation = () => undefined;
export const useAnimatedStyle = <T,>(factory: () => T) => factory();
export const useReducedMotion = () => false;
export const useSharedValue = <T,>(value: T) => ({ value });
export const withRepeat = <T,>(value: T) => value;
export const withTiming = <T,>(value: T) => value;

export default Animated;

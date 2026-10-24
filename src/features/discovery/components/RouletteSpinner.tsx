import { useEffect } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import {
  DISCOVERY_TIMING,
  ROULETTE_APPEARANCE,
} from '@/features/discovery/constants/discovery.constants';
import { DISCOVERY_LABELS } from '@/features/discovery/constants/discovery.labels';
import {
  CartesianPoint,
  RouletteSpinnerProps,
} from '@/features/discovery/types/discovery.types';
import { getCircularGestureDeltaDegrees } from '@/features/discovery/utils/getCircularGestureDeltaDegrees';
import colors from '@/theme/colors.json';

function pointOnCircle(
  center: number,
  radius: number,
  angleDegrees: number,
): CartesianPoint {
  const angleRadians = (angleDegrees * Math.PI) / 180;

  return {
    x: center + radius * Math.cos(angleRadians),
    y: center + radius * Math.sin(angleRadians),
  };
}

export function RouletteSpinner({
  disabled = false,
  onSpinRequest,
  onStopped,
  phase = 'spinning',
}: RouletteSpinnerProps) {
  const { width } = useWindowDimensions();
  const size = Math.min(
    ROULETTE_APPEARANCE.maxSize,
    Math.max(ROULETTE_APPEARANCE.minSize, width - 84),
  );
  const center = size / 2;
  const radius = size * ROULETTE_APPEARANCE.radiusRatio;
  const segmentAngle = 360 / ROULETTE_APPEARANCE.segmentCount;
  const rotation = useSharedValue(0);
  const gestureAccumulatedAngle = useSharedValue(0);
  const gestureIsValid = useSharedValue(false);
  const gestureLastAngle = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const interactive = phase === 'idle' && Boolean(onSpinRequest) && !disabled;

  const circularGesture = Gesture.Pan()
    .enabled(interactive)
    .minDistance(8)
    .withTestId('roulette-circular-gesture')
    .onBegin((event) => {
      cancelAnimation(rotation);
      gestureAccumulatedAngle.value = 0;
      gestureIsValid.value =
        Math.hypot(event.x - center, event.y - center) >=
        size * ROULETTE_APPEARANCE.gestureMinimumRadiusRatio;
      gestureLastAngle.value =
        (Math.atan2(event.y - center, event.x - center) * 180) / Math.PI;
    })
    .onUpdate((event) => {
      if (
        !gestureIsValid.value ||
        Math.hypot(event.x - center, event.y - center) <
          size * ROULETTE_APPEARANCE.gestureMinimumRadiusRatio
      ) {
        gestureIsValid.value = false;
        return;
      }

      const currentAngle =
        (Math.atan2(event.y - center, event.x - center) * 180) / Math.PI;
      const angleDelta = getCircularGestureDeltaDegrees(
        gestureLastAngle.value,
        currentAngle,
      );

      gestureAccumulatedAngle.value += angleDelta;
      gestureLastAngle.value = currentAngle;
      rotation.value += angleDelta;
    })
    .onEnd(() => {
      if (
        gestureIsValid.value &&
        Math.abs(gestureAccumulatedAngle.value) >=
          ROULETTE_APPEARANCE.gestureActivationDegrees
      ) {
        if (onSpinRequest) {
          runOnJS(onSpinRequest)();
        }
        return;
      }

      rotation.value = withTiming(0, {
        duration: ROULETTE_APPEARANCE.gestureResetDurationMs,
        easing: Easing.out(Easing.cubic),
      });
    })
    .onFinalize((_event, success) => {
      if (!success) {
        rotation.value = withTiming(0, {
          duration: ROULETTE_APPEARANCE.gestureResetDurationMs,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

  useEffect(() => {
    cancelAnimation(rotation);

    if (phase === 'idle') {
      rotation.value = withTiming(0, { duration: 250 });
      return () => cancelAnimation(rotation);
    }

    if (phase === 'stopping') {
      const finishStopping = (finished?: boolean) => {
        'worklet';

        if (finished && onStopped) {
          runOnJS(onStopped)();
        }
      };

      rotation.value = withTiming(
        rotation.value +
          (reducedMotion ? 18 : DISCOVERY_TIMING.rouletteStopRotationDegrees),
        {
          duration: reducedMotion
            ? 250
            : DISCOVERY_TIMING.rouletteStopDurationMs,
          easing: Easing.out(Easing.cubic),
        },
        finishStopping,
      );

      return () => cancelAnimation(rotation);
    }

    if (reducedMotion) {
      rotation.value = withTiming(18, { duration: 250 });
      return () => cancelAnimation(rotation);
    }

    rotation.value = withRepeat(
      withTiming(rotation.value + 360, {
        duration: DISCOVERY_TIMING.rouletteSpinDurationMs,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    return () => cancelAnimation(rotation);
  }, [onStopped, phase, reducedMotion, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const segments = Array.from(
    { length: ROULETTE_APPEARANCE.segmentCount },
    (_, index) => {
      const start = pointOnCircle(center, radius, -90 + index * segmentAngle);
      const end = pointOnCircle(
        center,
        radius,
        -90 + (index + 1) * segmentAngle,
      );

      return {
        color:
          ROULETTE_APPEARANCE.segmentColors[
            index % ROULETTE_APPEARANCE.segmentColors.length
          ],
        path: `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y} Z`,
      };
    },
  );

  return (
    <GestureDetector gesture={circularGesture}>
      <Pressable
        accessibilityHint={
          onSpinRequest
            ? DISCOVERY_LABELS.accessibility.rouletteSpinHint
            : undefined
        }
        accessibilityLabel={
          onSpinRequest && phase === 'idle'
            ? DISCOVERY_LABELS.accessibility.rouletteSpinAction
            : phase !== 'idle'
              ? DISCOVERY_LABELS.accessibility.rouletteSpinning
              : DISCOVERY_LABELS.accessibility.rouletteIdle
        }
        accessibilityRole={
          onSpinRequest && phase === 'idle'
            ? 'button'
            : phase !== 'idle'
              ? 'progressbar'
              : 'image'
        }
        accessibilityState={
          onSpinRequest ? { disabled: !interactive } : undefined
        }
        className="items-center"
        disabled={!interactive}
        onPress={onSpinRequest}
        style={{ height: size + 20, width: size }}
      >
        <View
          style={{
            borderLeftColor: 'transparent',
            borderLeftWidth: 18,
            borderRightColor: 'transparent',
            borderRightWidth: 18,
            borderTopColor: colors.primary,
            borderTopWidth: 34,
            height: 0,
            position: 'absolute',
            top: 0,
            width: 0,
            zIndex: 3,
          }}
        />
        <Animated.View
          style={[
            {
              borderRadius: size / 2,
              elevation: 4,
              height: size,
              position: 'absolute',
              shadowColor: colors.foreground,
              shadowOffset: { height: 7, width: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              top: 15,
              width: size,
            },
            animatedStyle,
          ]}
        >
          <Svg height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
            {segments.map((segment, index) => (
              <Path
                d={segment.path}
                fill={segment.color}
                key={index}
                stroke={colors.background}
                strokeWidth={2}
              />
            ))}
            <Circle
              cx={center}
              cy={center}
              fill="none"
              r={radius}
              stroke={colors.primary}
              strokeWidth={7}
            />
            <Circle
              cx={center}
              cy={center}
              fill={colors.primary}
              r={size * ROULETTE_APPEARANCE.hubRadiusRatio}
              stroke={colors.surface}
              strokeWidth={6}
            />
          </Svg>

          {ROULETTE_APPEARANCE.foodIcons.map((icon, index) => {
            const position = pointOnCircle(
              center,
              size * ROULETTE_APPEARANCE.iconRadiusRatio,
              -90 + (index + 0.5) * segmentAngle,
            );
            const iconSize = size * 0.105;

            return (
              <Text
                key={`${icon}-${index}`}
                style={{
                  fontSize: iconSize,
                  height: iconSize * 1.35,
                  left: position.x - iconSize * 0.68,
                  lineHeight: iconSize * 1.25,
                  position: 'absolute',
                  textAlign: 'center',
                  top: position.y - iconSize * 0.68,
                  width: iconSize * 1.35,
                }}
              >
                {icon}
              </Text>
            );
          })}

          <View
            className="absolute items-center justify-center"
            style={{
              height: size * ROULETTE_APPEARANCE.hubRadiusRatio * 2,
              left: center - size * ROULETTE_APPEARANCE.hubRadiusRatio,
              top: center - size * ROULETTE_APPEARANCE.hubRadiusRatio,
              width: size * ROULETTE_APPEARANCE.hubRadiusRatio * 2,
            }}
          >
            <Text style={{ fontSize: size * 0.1 }}>🎲</Text>
          </View>
        </Animated.View>
      </Pressable>
    </GestureDetector>
  );
}

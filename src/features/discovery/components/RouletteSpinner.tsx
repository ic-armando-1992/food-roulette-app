import { useEffect } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
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
import colors from '@/theme/colors.json';

type RouletteSpinnerProps = {
  spinning?: boolean;
};

function pointOnCircle(
  center: number,
  radius: number,
  angleDegrees: number,
): { x: number; y: number } {
  const angleRadians = (angleDegrees * Math.PI) / 180;

  return {
    x: center + radius * Math.cos(angleRadians),
    y: center + radius * Math.sin(angleRadians),
  };
}

export function RouletteSpinner({ spinning = true }: RouletteSpinnerProps) {
  const { width } = useWindowDimensions();
  const size = Math.min(
    ROULETTE_APPEARANCE.maxSize,
    Math.max(ROULETTE_APPEARANCE.minSize, width - 84),
  );
  const center = size / 2;
  const radius = size * ROULETTE_APPEARANCE.radiusRatio;
  const segmentAngle = 360 / ROULETTE_APPEARANCE.segmentCount;
  const rotation = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    cancelAnimation(rotation);

    if (!spinning || reducedMotion) {
      rotation.value = withTiming(spinning ? 18 : 0, { duration: 250 });
      return () => cancelAnimation(rotation);
    }

    rotation.value = withRepeat(
      withTiming(rotation.value + 360, {
        duration: DISCOVERY_TIMING.rouletteSpinDurationMs,
        easing: Easing.out(Easing.cubic),
      }),
      -1,
      false,
    );

    return () => cancelAnimation(rotation);
  }, [reducedMotion, rotation, spinning]);

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
    <View
      accessibilityLabel={spinning ? 'Ruleta girando' : 'Ruleta de comida'}
      accessibilityRole={spinning ? 'progressbar' : 'image'}
      className="items-center"
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
    </View>
  );
}

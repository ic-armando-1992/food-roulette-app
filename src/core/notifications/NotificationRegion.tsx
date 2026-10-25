import {
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';

import {
  NOTIFICATION_ANIMATION_DURATION_MS,
  NOTIFICATION_DEFAULT_DURATIONS_MS,
  NOTIFICATION_LABELS,
  NOTIFICATION_PRESENTATIONS,
} from '@/core/notifications/constants/notification.constants';
import { useNotificationStore } from '@/core/notifications/notification.store';
import {
  NotificationIconProps,
  NotificationRegionProps,
} from '@/core/notifications/types/notification.types';
import colors from '@/theme/colors.json';

function NotificationIcon({ type }: NotificationIconProps) {
  const color = NOTIFICATION_PRESENTATIONS[type].accentColor;

  if (type === 'success') {
    return <CheckCircle2 color={color} size={21} strokeWidth={2.4} />;
  }

  if (type === 'error') {
    return <CircleAlert color={color} size={21} strokeWidth={2.4} />;
  }

  if (type === 'warning') {
    return <TriangleAlert color={color} size={21} strokeWidth={2.4} />;
  }

  return <Info color={color} size={21} strokeWidth={2.4} />;
}

export function NotificationRegion({
  enabled = true,
}: NotificationRegionProps) {
  const reduceMotion = useReducedMotion();
  const notification = useNotificationStore((state) => state.queue[0]);
  const dismiss = useNotificationStore((state) => state.dismiss);

  useEffect(() => {
    if (!enabled || !notification || notification.persistent) {
      return;
    }

    const timeoutId = setTimeout(
      () => dismiss(notification.id),
      notification.durationMs ??
        NOTIFICATION_DEFAULT_DURATIONS_MS[notification.type],
    );

    return () => clearTimeout(timeoutId);
  }, [dismiss, enabled, notification]);

  const presentation = notification
    ? NOTIFICATION_PRESENTATIONS[notification.type]
    : null;

  return (
    <Animated.View
      className="w-full max-w-2xl self-center overflow-hidden px-5"
      layout={
        reduceMotion
          ? undefined
          : LinearTransition.duration(NOTIFICATION_ANIMATION_DURATION_MS)
      }
      pointerEvents="box-none"
    >
      {enabled && notification && presentation ? (
        <Animated.View
          accessibilityLiveRegion={
            notification.type === 'error' || notification.type === 'warning'
              ? 'assertive'
              : 'polite'
          }
          accessibilityRole="alert"
          className="mb-3 flex-row items-start gap-3 rounded-2xl border px-3 py-3"
          entering={
            reduceMotion
              ? undefined
              : FadeInDown.duration(NOTIFICATION_ANIMATION_DURATION_MS)
          }
          exiting={
            reduceMotion
              ? undefined
              : FadeOutUp.duration(NOTIFICATION_ANIMATION_DURATION_MS)
          }
          key={notification.id}
          style={{
            backgroundColor: presentation.surfaceColor,
            borderColor: presentation.borderColor,
            shadowColor: colors.foreground,
            shadowOffset: { height: 4, width: 0 },
            shadowOpacity: 0.08,
            shadowRadius: 14,
            elevation: 2,
          }}
        >
          <View
            className="mt-0.5 h-9 w-9 items-center justify-center rounded-xl bg-surface/80"
            importantForAccessibility="no"
          >
            <NotificationIcon type={notification.type} />
          </View>
          <View className="min-h-9 flex-1 justify-center">
            <Text className="text-sm font-extrabold leading-5 text-foreground">
              {notification.message}
            </Text>
            {notification.description ? (
              <Text className="mt-0.5 text-sm leading-5 text-mutedForeground">
                {notification.description}
              </Text>
            ) : null}
          </View>
          <Pressable
            accessibilityLabel={NOTIFICATION_LABELS.close}
            accessibilityRole="button"
            className="h-9 w-9 items-center justify-center rounded-full"
            hitSlop={6}
            onPress={() => dismiss(notification.id)}
            style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}
          >
            <X color={colors.mutedForeground} size={18} />
          </Pressable>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

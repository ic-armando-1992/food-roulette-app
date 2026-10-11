import { ChevronDown, ChevronUp, Clock3 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { DISCOVERY_LABELS } from '@/features/discovery/constants/discovery.labels';
import { OpeningHoursSectionProps } from '@/features/discovery/types/discovery.types';
import colors from '@/theme/colors.json';

function isSameLocalDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function formatTransition(timestamp: string | undefined, verb: string) {
  if (!timestamp) {
    return null;
  }

  const transition = new Date(timestamp);

  if (Number.isNaN(transition.getTime())) {
    return null;
  }

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const day = isSameLocalDay(transition, now)
    ? DISCOVERY_LABELS.hours.today
    : isSameLocalDay(transition, tomorrow)
      ? DISCOVERY_LABELS.hours.tomorrow
      : new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(
          transition,
        );
  const time = new Intl.DateTimeFormat('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(transition);

  return DISCOVERY_LABELS.hours.transition(verb, day, time);
}

export function OpeningHoursSection({
  openingHours,
}: OpeningHoursSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const hasWeeklyHours = openingHours.weekdayDescriptions.length > 0;
  const statusLabel =
    openingHours.openNow === true
      ? DISCOVERY_LABELS.hours.openNow
      : openingHours.openNow === false
        ? DISCOVERY_LABELS.hours.closedNow
        : DISCOVERY_LABELS.hours.available;
  const transitionLabel =
    openingHours.openNow === true
      ? formatTransition(
          openingHours.nextCloseTime,
          DISCOVERY_LABELS.hours.closeVerb,
        )
      : formatTransition(
          openingHours.nextOpenTime,
          DISCOVERY_LABELS.hours.openVerb,
        );
  const statusColor =
    openingHours.openNow === true ? colors.success : colors.error;
  const containerColor =
    openingHours.openNow === true
      ? colors.successSurface
      : colors.surfaceSecondary;
  const borderColor =
    openingHours.openNow === true ? colors.successBorder : colors.border;

  return (
    <View
      className="rounded-2xl border px-4 py-4"
      style={{ backgroundColor: containerColor, borderColor }}
    >
      <View className="flex-row items-start gap-3">
        <Clock3 color={statusColor} size={21} />
        <View className="flex-1">
          <Text className="font-extrabold" style={{ color: statusColor }}>
            {statusLabel}
          </Text>
          {transitionLabel ? (
            <Text className="mt-1 text-sm text-mutedForeground">
              {transitionLabel}
            </Text>
          ) : null}
        </View>
        {hasWeeklyHours ? (
          <Pressable
            accessibilityLabel={
              expanded
                ? DISCOVERY_LABELS.accessibility.weeklyHoursHide
                : DISCOVERY_LABELS.accessibility.weeklyHoursShow
            }
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            className="flex-row items-center gap-1"
            onPress={() => setExpanded((current) => !current)}
          >
            <Text className="text-sm font-bold text-foreground">
              {DISCOVERY_LABELS.hours.schedule}
            </Text>
            {expanded ? (
              <ChevronUp color={colors.foreground} size={17} />
            ) : (
              <ChevronDown color={colors.foreground} size={17} />
            )}
          </Pressable>
        ) : null}
      </View>

      {expanded ? (
        <View className="mt-4 gap-2 border-t border-border pt-4">
          {openingHours.weekdayDescriptions.map((description) => (
            <Text
              className="text-sm leading-5 text-mutedForeground"
              key={description}
            >
              {description}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

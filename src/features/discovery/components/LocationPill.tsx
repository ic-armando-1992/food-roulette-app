import { ChevronDown, LocateFixed } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { CurrentLocationState } from '@/features/discovery/hooks/useCurrentLocation';
import colors from '@/theme/colors.json';

type LocationPillProps = {
  state: CurrentLocationState;
};

export function LocationPill({ state }: LocationPillProps) {
  const label =
    state.status === 'granted'
      ? state.label
      : state.status === 'requesting'
        ? 'Buscando ubicación…'
        : 'Ubicación no disponible';

  return (
    <View className="max-w-full flex-row items-center gap-2 self-center rounded-full bg-surfaceSecondary px-4 py-2.5">
      <LocateFixed
        color={state.status === 'granted' ? colors.success : colors.primary}
        size={18}
      />
      <Text
        className="max-w-64 text-sm font-bold text-foreground"
        numberOfLines={1}
      >
        {label}
      </Text>
      {state.status === 'granted' ? (
        <ChevronDown color={colors.mutedForeground} size={16} />
      ) : null}
    </View>
  );
}

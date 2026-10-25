import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, TriangleAlert } from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { SessionRecoveryNotice } from '@/features/auth/components/SessionRecoveryNotice';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import { VisitCard } from '@/features/visits/components/VisitCard';
import { VISITS_LABELS } from '@/features/visits/constants/visits.labels';
import { useVisits } from '@/features/visits/hooks/useVisits';
import colors from '@/theme/colors.json';

export function VisitsScreen() {
  const router = useRouter();
  const auth = useAuth();
  const visits = useVisits();
  const items = visits.data?.visits ?? [];
  const showLoading =
    auth.status === 'initializing' ||
    (auth.status === 'ready' && visits.isPending);
  const showError = auth.status === 'unavailable' || visits.isError;

  const retry = () => {
    if (auth.status === 'unavailable') {
      void auth.retry();
      return;
    }

    void visits.refetch();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center gap-3 px-5 py-3">
        <Pressable
          accessibilityLabel={VISITS_LABELS.accessibility.back}
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full bg-surfaceSecondary"
          onPress={() => router.back()}
        >
          <ArrowLeft color={colors.foreground} size={22} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-2xl font-black text-foreground">
            {VISITS_LABELS.title}
          </Text>
          <Text className="text-sm text-mutedForeground">
            {VISITS_LABELS.subtitle}
          </Text>
        </View>
      </View>

      <SessionRecoveryNotice />

      {showLoading ? (
        <View className="flex-1 items-center justify-center px-8">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : showError ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <TriangleAlert color={colors.error} size={34} />
          <Text
            accessibilityRole="alert"
            className="text-center text-base leading-6 text-mutedForeground"
          >
            {auth.status === 'unavailable'
              ? VISITS_LABELS.error.authUnavailable
              : VISITS_LABELS.error.list}
          </Text>
          <View className="w-full">
            <Button label={VISITS_LABELS.actions.retry} onPress={retry} />
          </View>
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-surfaceSecondary">
            <MapPin color={colors.primary} size={36} />
          </View>
          <Text className="mt-5 text-center text-2xl font-black text-foreground">
            {VISITS_LABELS.empty.title}
          </Text>
          <Text className="mt-2 text-center text-base leading-6 text-mutedForeground">
            {VISITS_LABELS.empty.subtitle}
          </Text>
        </View>
      ) : (
        <FlatList
          accessibilityLabel={VISITS_LABELS.accessibility.list}
          contentContainerClassName="gap-5 px-5 pb-8 pt-3"
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <VisitCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}

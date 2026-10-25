import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, TriangleAlert } from 'lucide-react-native';
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
import { FavoriteCard } from '@/features/favorites/components/FavoriteCard';
import { FAVORITES_LABELS } from '@/features/favorites/constants/favorites.labels';
import {
  useFavorites,
  useRemoveFavorite,
} from '@/features/favorites/hooks/useFavorites';
import colors from '@/theme/colors.json';

export function FavoritesScreen() {
  const router = useRouter();
  const auth = useAuth();
  const favorites = useFavorites();
  const removeFavorite = useRemoveFavorite();
  const items = favorites.data?.favorites ?? [];
  const showLoading =
    auth.status === 'initializing' ||
    (auth.status === 'ready' && favorites.isPending);
  const showError =
    auth.status === 'unavailable' ||
    favorites.isError ||
    removeFavorite.isError;

  const retry = () => {
    removeFavorite.reset();

    if (auth.status === 'unavailable') {
      void auth.retry();
      return;
    }

    void favorites.refetch();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center gap-3 px-5 py-3">
        <Pressable
          accessibilityLabel={FAVORITES_LABELS.accessibility.back}
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full bg-surfaceSecondary"
          onPress={() => router.back()}
        >
          <ArrowLeft color={colors.foreground} size={22} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-2xl font-black text-foreground">
            {FAVORITES_LABELS.title}
          </Text>
          <Text className="text-sm text-mutedForeground">
            {FAVORITES_LABELS.subtitle}
          </Text>
        </View>
      </View>

      <SessionRecoveryNotice />

      {showLoading ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
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
              ? FAVORITES_LABELS.error.authUnavailable
              : removeFavorite.isError
                ? FAVORITES_LABELS.error.mutation
                : FAVORITES_LABELS.error.list}
          </Text>
          <View className="w-full">
            <Button label={FAVORITES_LABELS.actions.retry} onPress={retry} />
          </View>
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-surfaceSecondary">
            <Heart color={colors.primary} size={36} />
          </View>
          <Text className="mt-5 text-center text-2xl font-black text-foreground">
            {FAVORITES_LABELS.empty.title}
          </Text>
          <Text className="mt-2 text-center text-base leading-6 text-mutedForeground">
            {FAVORITES_LABELS.empty.subtitle}
          </Text>
        </View>
      ) : (
        <FlatList
          accessibilityLabel={FAVORITES_LABELS.accessibility.list}
          contentContainerClassName="gap-5 px-5 pb-8 pt-3"
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FavoriteCard
              isRemoving={
                removeFavorite.isPending &&
                removeFavorite.variables === item.restaurantId
              }
              item={item}
              onRemove={(restaurantId) => removeFavorite.mutate(restaurantId)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

import { useRouter } from 'expo-router';
import { ArrowLeft, TriangleAlert } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  ListRenderItem,
  PixelRatio,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserAchievement } from '@/api/contracts/achievements';
import { Button } from '@/components/ui/Button';
import { SessionRecoveryNotice } from '@/features/auth/components/SessionRecoveryNotice';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import colors from '@/theme/colors.json';
import { AchievementCard } from '../components/AchievementCard';
import { AchievementDetail } from '../components/AchievementDetail';
import { AchievementFilters } from '../components/AchievementFilters';
import { AchievementSummaryCard } from '../components/AchievementSummaryCard';
import {
  ACHIEVEMENT_GRID_BOTTOM_PADDING,
  ACHIEVEMENT_GRID_COLUMNS,
  ACHIEVEMENT_GRID_GAP,
  ACHIEVEMENT_GRID_HORIZONTAL_PADDING,
  ACHIEVEMENT_GRID_TOP_PADDING,
  ACHIEVEMENT_CARD_HEIGHT,
  ACHIEVEMENT_INITIAL_RENDER_COUNT,
  ACHIEVEMENT_RENDER_BATCH_SIZE,
  ACHIEVEMENT_WINDOW_SIZE,
  DEFAULT_ACHIEVEMENT_PROGRESSION,
} from '../constants/achievement.constants';
import { ACHIEVEMENT_LABELS } from '../constants/achievement.labels';
import {
  useAchievementCatalog,
  useMyAchievements,
  useRefreshAchievements,
} from '../hooks/useAchievements';
import { AchievementFilter } from '../types/achievement.types';
import {
  buildAchievementFilterOptions,
  calculateAchievementCardWidth,
  filterAchievements,
} from '../utils/achievement-ui';

const keyExtractor = (achievement: UserAchievement) => achievement.id;

function AchievementRowSeparator() {
  return <View style={{ height: ACHIEVEMENT_GRID_GAP }} />;
}

export function AchievementsScreen() {
  const router = useRouter();
  const auth = useAuth();
  const catalog = useAchievementCatalog();
  const mine = useMyAchievements();
  const { isRefreshing, refresh, refreshError } = useRefreshAchievements();
  const [filter, setFilter] = useState<AchievementFilter>('ALL');
  const [selected, setSelected] = useState<UserAchievement | null>(null);
  const [listViewportWidth, setListViewportWidth] = useState(0);

  const achievements = useMemo<UserAchievement[]>(() => {
    if (mine.data) return mine.data.achievements;
    return (catalog.data?.achievements ?? []).map((achievement) => ({
      ...achievement,
      progress: achievement.isSecret ? null : 0,
      unlockedAt: null,
    }));
  }, [catalog.data, mine.data]);
  const filterOptions = useMemo(
    () => buildAchievementFilterOptions(achievements),
    [achievements],
  );
  const filteredAchievements = useMemo(
    () => filterAchievements(achievements, filter),
    [achievements, filter],
  );
  const unlockedAchievements = useMemo(
    () => achievements.filter((achievement) => achievement.unlockedAt).length,
    [achievements],
  );
  const progression = mine.data?.progression ?? DEFAULT_ACHIEVEMENT_PROGRESSION;
  const cardWidth = useMemo(
    () => calculateAchievementCardWidth(listViewportWidth, PixelRatio.get()),
    [listViewportWidth],
  );
  const gridCellStyle = useMemo(
    () => ({ height: ACHIEVEMENT_CARD_HEIGHT, width: cardWidth }),
    [cardWidth],
  );
  const loading =
    achievements.length === 0 && (catalog.isPending || mine.isPending);
  const error =
    achievements.length === 0 &&
    (auth.status === 'unavailable' || (catalog.isError && mine.isError));

  const handleSelect = useCallback((achievement: UserAchievement) => {
    setSelected(achievement);
  }, []);
  const handleCloseDetail = useCallback(() => setSelected(null), []);
  const handleListLayout = useCallback((event: LayoutChangeEvent) => {
    const measuredWidth = event.nativeEvent.layout.width;
    setListViewportWidth((currentWidth) =>
      Math.abs(currentWidth - measuredWidth) < 0.5
        ? currentWidth
        : measuredWidth,
    );
  }, []);
  const handleRefresh = useCallback(() => {
    void refresh().catch(() => undefined);
  }, [refresh]);
  const handleRetry = useCallback(() => {
    if (auth.status === 'unavailable') {
      void auth.retry();
      return;
    }
    void Promise.all([catalog.refetch(), mine.refetch()]);
  }, [auth, catalog, mine]);
  const renderAchievement = useCallback<ListRenderItem<UserAchievement>>(
    ({ item }) => (
      <View style={gridCellStyle} testID={`achievement-grid-cell-${item.id}`}>
        <AchievementCard achievement={item} onPress={handleSelect} />
      </View>
    ),
    [gridCellStyle, handleSelect],
  );

  const listHeader = useMemo(
    () => (
      <View>
        <AchievementSummaryCard
          progression={progression}
          totalAchievements={achievements.length}
          unlockedAchievements={unlockedAchievements}
        />
        {refreshError ? (
          <View
            accessibilityRole="alert"
            className="mt-3 flex-row items-center rounded-2xl border border-warningBorder bg-warningSurface px-3 py-2.5"
          >
            <TriangleAlert color={colors.warning} size={17} />
            <Text className="ml-2 flex-1 text-xs font-semibold text-warning">
              {ACHIEVEMENT_LABELS.error.refresh}
            </Text>
          </View>
        ) : null}
        <AchievementFilters
          activeFilter={filter}
          onChange={setFilter}
          options={filterOptions}
        />
      </View>
    ),
    [
      achievements.length,
      filter,
      filterOptions,
      progression,
      refreshError,
      unlockedAchievements,
    ],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center gap-3 px-5 py-3">
        <Pressable
          accessibilityLabel={ACHIEVEMENT_LABELS.accessibility.back}
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full bg-surfaceSecondary"
          onPress={() => router.back()}
        >
          <ArrowLeft color={colors.foreground} size={22} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-2xl font-black text-foreground">
            {ACHIEVEMENT_LABELS.title}
          </Text>
          <Text className="text-sm text-mutedForeground">
            {ACHIEVEMENT_LABELS.subtitle}
          </Text>
        </View>
      </View>
      <SessionRecoveryNotice />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <TriangleAlert color={colors.error} size={34} />
          <Text
            accessibilityRole="alert"
            className="text-center text-mutedForeground"
          >
            {ACHIEVEMENT_LABELS.error.load}
          </Text>
          <Button
            label={ACHIEVEMENT_LABELS.actions.retry}
            onPress={handleRetry}
          />
        </View>
      ) : (
        <View
          className="flex-1"
          onLayout={handleListLayout}
          testID="achievements-list-viewport"
        >
          {cardWidth > 0 ? (
            <FlatList
              accessibilityLabel={ACHIEVEMENT_LABELS.accessibility.list}
              ListEmptyComponent={
                <View className="items-center px-8 py-14">
                  <Text className="text-center text-base font-semibold text-mutedForeground">
                    {achievements.length === 0
                      ? ACHIEVEMENT_LABELS.error.empty
                      : ACHIEVEMENT_LABELS.error.emptyFilter}
                  </Text>
                </View>
              }
              ListHeaderComponent={listHeader}
              ListHeaderComponentStyle={{ marginBottom: ACHIEVEMENT_GRID_GAP }}
              columnWrapperStyle={{
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
              contentContainerStyle={{
                paddingBottom: ACHIEVEMENT_GRID_BOTTOM_PADDING,
                paddingHorizontal: ACHIEVEMENT_GRID_HORIZONTAL_PADDING,
                paddingTop: ACHIEVEMENT_GRID_TOP_PADDING,
              }}
              data={filteredAchievements}
              initialNumToRender={ACHIEVEMENT_INITIAL_RENDER_COUNT}
              ItemSeparatorComponent={AchievementRowSeparator}
              keyExtractor={keyExtractor}
              maxToRenderPerBatch={ACHIEVEMENT_RENDER_BATCH_SIZE}
              numColumns={ACHIEVEMENT_GRID_COLUMNS}
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
              removeClippedSubviews={Platform.OS === 'android'}
              renderItem={renderAchievement}
              showsVerticalScrollIndicator={false}
              updateCellsBatchingPeriod={32}
              windowSize={ACHIEVEMENT_WINDOW_SIZE}
            />
          ) : null}
        </View>
      )}
      <AchievementDetail achievement={selected} onClose={handleCloseDetail} />
    </SafeAreaView>
  );
}

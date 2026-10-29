import { Href, useRouter } from 'expo-router';
import { Heart, MapPin, Sparkles, Trophy } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RandomRecommendationResponse } from '@/api/contracts/recommendations';
import { markSpinMapsOpened } from '@/api/endpoints/spins.api';
import { Button } from '@/components/ui/Button';
import { NotificationRegion } from '@/core/notifications/NotificationRegion';
import { notify } from '@/core/notifications/notify';
import { AccountButton } from '@/features/auth/components/AccountButton';
import { AccountModal } from '@/features/auth/components/AccountModal';
import { GoogleLinkPrompt } from '@/features/auth/components/GoogleLinkPrompt';
import { SessionRecoveryNotice } from '@/features/auth/components/SessionRecoveryNotice';
import { useGoogleLinkPrompt } from '@/features/auth/hooks/useGoogleLinkPrompt';
import { useFavoriteStatus } from '@/features/favorites/hooks/useFavoriteStatus';
import { useCheckIn } from '@/features/visits/hooks/useCheckIn';
import { LocationPill } from '@/features/discovery/components/LocationPill';
import { RadiusSelector } from '@/features/discovery/components/RadiusSelector';
import { RecommendationCard } from '@/features/discovery/components/RecommendationCard';
import { RouletteLoadingState } from '@/features/discovery/components/RouletteLoadingState';
import { RouletteSpinner } from '@/features/discovery/components/RouletteSpinner';
import { DISCOVERY_LOCATION } from '@/features/discovery/constants/discovery.constants';
import { DISCOVERY_LABELS } from '@/features/discovery/constants/discovery.labels';
import { useCurrentLocation } from '@/features/discovery/hooks/useCurrentLocation';
import { useRandomRecommendation } from '@/features/discovery/hooks/useRandomRecommendation';
import { useDiscoveryStore } from '@/features/discovery/store/discovery.store';
import {
  BrandHeaderProps,
  Coordinates,
  DiscoveryView,
  RouletteSpinPhase,
} from '@/features/discovery/types/discovery.types';
import { getRecommendationErrorMessage } from '@/features/discovery/utils/getRecommendationErrorMessage';
import { getGeographicDistanceMeters } from '@/features/discovery/utils/getGeographicDistanceMeters';
import { waitForMinimumSpinDuration } from '@/features/discovery/utils/waitForMinimumSpinDuration';
import {
  createTelemetryId,
  getTelemetryErrorProperties,
  trackProductEvent,
} from '@/core/telemetry/telemetry';
import { TELEMETRY_EVENTS } from '@/core/telemetry/constants/telemetry.constants';
import colors from '@/theme/colors.json';
import { useAchievementNotifications } from '@/features/achievements/providers/AchievementNotificationsProvider';
import { useProgression } from '@/features/achievements/hooks/useProgression';

function BrandHeader({
  actionsDisabled = false,
  onAccountPress,
  onAchievementsPress,
  onFavoritesPress,
  onVisitsPress,
  showAchievements = false,
  showFavorites = false,
  showVisits = false,
}: BrandHeaderProps) {
  const progression = useProgression();
  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <Text className="text-sm font-extrabold uppercase tracking-widest text-primary">
        {DISCOVERY_LABELS.brandName}
      </Text>
      <View className="flex-row items-center gap-2">
        {showAchievements && onAchievementsPress ? (
          <Pressable
            accessibilityLabel="Abrir mis logros"
            accessibilityRole="button"
            accessibilityState={{ disabled: actionsDisabled }}
            className="h-11 w-11 items-center justify-center rounded-full bg-surfaceSecondary"
            disabled={actionsDisabled}
            onPress={onAchievementsPress}
          >
            <Trophy color={colors.foreground} size={21} />
          </Pressable>
        ) : null}
        {showVisits && onVisitsPress ? (
          <Pressable
            accessibilityLabel={DISCOVERY_LABELS.accessibility.visits}
            accessibilityRole="button"
            accessibilityState={{ disabled: actionsDisabled }}
            className="h-11 w-11 items-center justify-center rounded-full bg-surfaceSecondary"
            disabled={actionsDisabled}
            onPress={onVisitsPress}
            style={({ pressed }) => ({
              opacity: actionsDisabled ? 0.5 : pressed ? 0.7 : 1,
            })}
          >
            <MapPin color={colors.foreground} size={21} />
          </Pressable>
        ) : null}
        {showFavorites && onFavoritesPress ? (
          <Pressable
            accessibilityLabel={DISCOVERY_LABELS.accessibility.favorites}
            accessibilityRole="button"
            accessibilityState={{ disabled: actionsDisabled }}
            className="h-11 w-11 items-center justify-center rounded-full bg-surfaceSecondary"
            disabled={actionsDisabled}
            onPress={onFavoritesPress}
            style={({ pressed }) => ({
              opacity: actionsDisabled ? 0.5 : pressed ? 0.7 : 1,
            })}
          >
            <Heart color={colors.foreground} size={21} />
          </Pressable>
        ) : null}
        <AccountButton
          disabled={actionsDisabled}
          level={progression.data?.level}
          onPress={onAccountPress}
        />
      </View>
    </View>
  );
}

export function DiscoverScreen() {
  const router = useRouter();
  const achievementNotifications = useAchievementNotifications();
  const progression = useProgression();
  const radiusMeters = useDiscoveryStore((state) => state.radiusMeters);
  const setRadiusMeters = useDiscoveryStore((state) => state.setRadiusMeters);
  const {
    requestLocation,
    state: locationState,
    synchronizeLocation,
  } = useCurrentLocation();
  const recommendation = useRandomRecommendation();
  const checkIn = useCheckIn({
    onLocationResolved: async (location) => {
      await synchronizeLocation(location);
    },
  });
  const googleLinkPrompt = useGoogleLinkPrompt();
  const [accountVisible, setAccountVisible] = useState(false);
  const [excludedRestaurantIds, setExcludedRestaurantIds] = useState<string[]>(
    [],
  );
  const [displayedResult, setDisplayedResult] =
    useState<RandomRecommendationResponse | null>(null);
  const [displayedSpinId, setDisplayedSpinId] = useState<string | null>(null);
  const [displayedVisitId, setDisplayedVisitId] = useState<string | null>(null);
  const [view, setView] = useState<DiscoveryView>('home');
  const [roulettePhase, setRoulettePhase] = useState<RouletteSpinPhase>('idle');
  const requestedLocationOnMount = useRef(false);
  const requestInFlight = useRef(false);
  const lastSearchCoordinates = useRef<Coordinates | null>(null);
  const stopAnimationResolver = useRef<(() => void) | null>(null);
  const rouletteSessionId = useRef<string | null>(null);
  const isSpinning = roulettePhase !== 'idle';
  const favorite = useFavoriteStatus(
    view === 'result' && !isSpinning
      ? (displayedResult?.recommendation.id ?? '')
      : '',
  );

  const waitForRouletteToStop = useCallback(
    () =>
      new Promise<void>((resolve) => {
        stopAnimationResolver.current = resolve;
        setRoulettePhase('stopping');
      }),
    [],
  );

  const handleRouletteStopped = useCallback(() => {
    stopAnimationResolver.current?.();
    stopAnimationResolver.current = null;
  }, []);

  useEffect(() => {
    if (!requestedLocationOnMount.current) {
      requestedLocationOnMount.current = true;
      void requestLocation();
    }
  }, [requestLocation]);

  useEffect(() => {
    if (!recommendation.isError) {
      return;
    }

    notify.error(DISCOVERY_LABELS.error.title, {
      description: getRecommendationErrorMessage(recommendation.error),
    });
  }, [recommendation.error, recommendation.isError]);

  useEffect(() => {
    if (checkIn.data?.status === 'verified') {
      void achievementNotifications.handleProgressionUpdate(
        checkIn.data.progressionUpdate,
      );
    }
  }, [achievementNotifications, checkIn.data]);

  const requestRecommendation = async (isReroll: boolean) => {
    if (
      locationState.status !== 'granted' ||
      recommendation.isPending ||
      requestInFlight.current
    ) {
      return;
    }

    const previousResult = displayedResult;
    const spinId = createTelemetryId();
    const activeSessionId =
      isReroll && rouletteSessionId.current
        ? rouletteSessionId.current
        : createTelemetryId();
    if (!isReroll) rouletteSessionId.current = activeSessionId;
    const startedAt = Date.now();
    const minimumSpinDuration = waitForMinimumSpinDuration();
    requestInFlight.current = true;
    setAccountVisible(false);
    setRoulettePhase('spinning');
    recommendation.reset();
    checkIn.reset();

    if (!isReroll) {
      setExcludedRestaurantIds([]);
    }

    if (isReroll && previousResult) {
      trackProductEvent(TELEMETRY_EVENTS.spinAgain, {
        restaurantId: previousResult.recommendation.id,
      });
    }
    trackProductEvent(TELEMETRY_EVENTS.spinStarted, {
      spinId,
      reroll: isReroll,
      radiusMeters,
    });

    try {
      const refreshedCoordinates = await requestLocation();

      if (!refreshedCoordinates) {
        throw new Error('location-unavailable');
      }

      const previousCoordinates = lastSearchCoordinates.current;
      const canReuseCandidatePool = Boolean(
        isReroll &&
        previousResult &&
        previousCoordinates &&
        previousCoordinates.countryCode === refreshedCoordinates.countryCode &&
        getGeographicDistanceMeters(
          previousCoordinates,
          refreshedCoordinates,
        ) <= DISCOVERY_LOCATION.candidatePoolReuseDistanceMeters,
      );
      const searchCoordinates = canReuseCandidatePool
        ? previousCoordinates!
        : refreshedCoordinates;
      const exclusions = canReuseCandidatePool ? excludedRestaurantIds : [];

      if (!canReuseCandidatePool) {
        setExcludedRestaurantIds([]);
      }

      const result = await recommendation.recommend({
        ...searchCoordinates,
        spinId,
        rouletteSessionId: activeSessionId,
        isReroll,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        allowInternational: false,
        radiusMeters,
        candidatePoolId: canReuseCandidatePool
          ? previousResult?.candidatePool.id
          : undefined,
        excludedRestaurantIds: exclusions.length > 0 ? exclusions : undefined,
      });

      await minimumSpinDuration;

      if (result) {
        trackProductEvent(TELEMETRY_EVENTS.spinResult, {
          spinId,
          reroll: isReroll,
          radiusMeters,
          durationMs: Date.now() - startedAt,
          restaurantId: result.recommendation.id,
          source: result.source,
        });
        setExcludedRestaurantIds([...exclusions, result.recommendation.id]);
        lastSearchCoordinates.current = searchCoordinates;
        setDisplayedResult(result);
        setDisplayedSpinId(spinId);
        setDisplayedVisitId(createTelemetryId());
        googleLinkPrompt.recordSuccessfulSpin();
        await waitForRouletteToStop();
        setView('result');
        void achievementNotifications.handleProgressionUpdate(
          result.progressionUpdate,
        );
      }
    } catch (error) {
      await minimumSpinDuration;
      trackProductEvent(TELEMETRY_EVENTS.spinFailed, {
        spinId,
        reroll: isReroll,
        radiusMeters,
        durationMs: Date.now() - startedAt,
        ...getTelemetryErrorProperties(error),
      });
      // TanStack Query retains the normalized error for the visible error state.
      await waitForRouletteToStop();
    } finally {
      requestInFlight.current = false;
      setRoulettePhase('idle');
    }
  };

  const handleRadiusChange = (nextRadiusMeters: number) => {
    if (nextRadiusMeters === radiusMeters || isSpinning) {
      return;
    }

    setRadiusMeters(nextRadiusMeters);
    lastSearchCoordinates.current = null;
    setExcludedRestaurantIds([]);
    recommendation.reset();
  };

  const locationReady = locationState.status === 'granted';

  if (isSpinning) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <BrandHeader
          actionsDisabled
          onAccountPress={() => setAccountVisible(true)}
        />
        <NotificationRegion />
        <ScrollView contentContainerClassName="flex-grow" scrollEnabled={false}>
          <RouletteLoadingState
            onSpinStopped={handleRouletteStopped}
            spinPhase={roulettePhase === 'stopping' ? 'stopping' : 'spinning'}
          />
        </ScrollView>
        <AccountModal
          onClose={() => setAccountVisible(false)}
          progression={progression.data}
          visible={accountVisible}
        />
      </SafeAreaView>
    );
  }

  if (view === 'result' && displayedResult) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <NotificationRegion />
        <SessionRecoveryNotice />
        <ScrollView className="flex-1" contentContainerClassName="pb-4">
          <RecommendationCard
            checkInResult={checkIn.data ?? null}
            favoriteDisabled={!favorite.isReady}
            isFavorite={favorite.isFavorite}
            isFavoritePending={favorite.isPending}
            isCheckInPending={checkIn.isPending}
            isRerolling={isSpinning}
            onBack={() => {
              recommendation.reset();
              rouletteSessionId.current = null;
              setView('home');
            }}
            onCheckIn={() => {
              if (displayedSpinId && displayedVisitId) {
                checkIn.mutate({
                  visitId: displayedVisitId,
                  spinId: displayedSpinId,
                  restaurantId: displayedResult.recommendation.id,
                });
              }
            }}
            onMapsOpened={() => {
              if (displayedSpinId) {
                void markSpinMapsOpened(displayedSpinId)
                  .then((update) =>
                    achievementNotifications.handleProgressionUpdate(update),
                  )
                  .catch(() => undefined);
                trackProductEvent(TELEMETRY_EVENTS.mapsOpened, {
                  restaurantId: displayedResult.recommendation.id,
                  spinId: displayedSpinId,
                });
              }
            }}
            onFavoriteToggle={() => favorite.toggle()}
            onReroll={() => void requestRecommendation(true)}
            result={displayedResult}
          />
          {googleLinkPrompt.visible ? (
            <GoogleLinkPrompt onDismiss={googleLinkPrompt.dismiss} />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <BrandHeader
        onAccountPress={() => setAccountVisible(true)}
        onAchievementsPress={() => router.push('/achievements' as Href)}
        onFavoritesPress={() => router.push('/favorites')}
        onVisitsPress={() => router.push('/visits')}
        showAchievements
        showFavorites
        showVisits
      />
      <NotificationRegion enabled={!accountVisible} />
      <SessionRecoveryNotice />
      <ScrollView
        contentContainerClassName="px-5 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center pt-1">
          <Text className="text-center text-4xl font-black leading-tight text-foreground">
            {DISCOVERY_LABELS.home.title}
          </Text>
          <Text className="mt-2 text-center text-base text-mutedForeground">
            {DISCOVERY_LABELS.home.subtitle}
          </Text>
          <View className="mt-4">
            <LocationPill state={locationState} />
          </View>
        </View>

        <View className="my-5 items-center">
          <RouletteSpinner
            disabled={!locationReady}
            onSpinRequest={() => void requestRecommendation(false)}
            phase="idle"
          />
        </View>

        <Button
          disabled={!locationReady}
          icon={<Sparkles color={colors.primaryForeground} size={21} />}
          label={DISCOVERY_LABELS.actions.spin}
          onPress={() => void requestRecommendation(false)}
        />

        <View className="mt-5">
          <RadiusSelector
            disabled={isSpinning}
            radiusMeters={radiusMeters}
            onChange={handleRadiusChange}
          />
        </View>

        {locationState.status === 'denied' ||
        locationState.status === 'error' ? (
          <View className="mt-5 gap-3 rounded-3xl bg-surface p-4">
            <Text className="font-bold text-foreground">
              {DISCOVERY_LABELS.home.locationRequired}
            </Text>
            {locationState.status === 'denied' ? (
              <Button
                label={DISCOVERY_LABELS.actions.openSettings}
                onPress={() => void Linking.openSettings()}
                variant="secondary"
              />
            ) : null}
            <Button
              label={DISCOVERY_LABELS.actions.retry}
              onPress={() => void requestLocation()}
              variant="secondary"
            />
          </View>
        ) : null}
      </ScrollView>
      <AccountModal
        onClose={() => setAccountVisible(false)}
        progression={progression.data}
        visible={accountVisible}
      />
    </SafeAreaView>
  );
}

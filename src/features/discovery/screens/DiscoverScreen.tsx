import { AlertCircle, Settings, Sparkles } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RandomRecommendationResponse } from '@/api/contracts/recommendations';
import { Button } from '@/components/ui/Button';
import { AccountButton } from '@/features/auth/components/AccountButton';
import { AccountModal } from '@/features/auth/components/AccountModal';
import { GoogleLinkPrompt } from '@/features/auth/components/GoogleLinkPrompt';
import { SessionRecoveryNotice } from '@/features/auth/components/SessionRecoveryNotice';
import { useGoogleLinkPrompt } from '@/features/auth/hooks/useGoogleLinkPrompt';
import { LocationPill } from '@/features/discovery/components/LocationPill';
import { RadiusSelector } from '@/features/discovery/components/RadiusSelector';
import { RecommendationCard } from '@/features/discovery/components/RecommendationCard';
import { RouletteLoadingState } from '@/features/discovery/components/RouletteLoadingState';
import { RouletteSpinner } from '@/features/discovery/components/RouletteSpinner';
import { DISCOVERY_LABELS } from '@/features/discovery/constants/discovery.labels';
import { useCurrentLocation } from '@/features/discovery/hooks/useCurrentLocation';
import { useRandomRecommendation } from '@/features/discovery/hooks/useRandomRecommendation';
import { useDiscoveryStore } from '@/features/discovery/store/discovery.store';
import {
  BrandHeaderProps,
  DiscoveryView,
  ErrorMessageProps,
} from '@/features/discovery/types/discovery.types';
import { getRecommendationErrorMessage } from '@/features/discovery/utils/getRecommendationErrorMessage';
import {
  createTelemetryId,
  getTelemetryErrorProperties,
  trackProductEvent,
} from '@/core/telemetry/telemetry';
import { TELEMETRY_EVENTS } from '@/core/telemetry/constants/telemetry.constants';
import colors from '@/theme/colors.json';

function BrandHeader({
  onAccountPress,
  showSettings = false,
}: BrandHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <Text className="text-sm font-extrabold uppercase tracking-widest text-primary">
        {DISCOVERY_LABELS.brandName}
      </Text>
      <View className="flex-row items-center gap-2">
        <AccountButton onPress={onAccountPress} />
        {showSettings ? (
          <Pressable
            accessibilityLabel={DISCOVERY_LABELS.accessibility.settings}
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-full bg-surfaceSecondary"
            onPress={() => void Linking.openSettings()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Settings color={colors.foreground} size={21} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <View className="mx-5 mb-4 flex-row gap-3 rounded-2xl bg-surface px-4 py-3">
      <AlertCircle color={colors.error} size={20} />
      <View className="flex-1">
        <Text className="font-bold text-error">
          {DISCOVERY_LABELS.error.title}
        </Text>
        <Text className="mt-1 text-sm leading-5 text-mutedForeground">
          {message}
        </Text>
      </View>
    </View>
  );
}

export function DiscoverScreen() {
  const radiusMeters = useDiscoveryStore((state) => state.radiusMeters);
  const setRadiusMeters = useDiscoveryStore((state) => state.setRadiusMeters);
  const { requestLocation, state: locationState } = useCurrentLocation();
  const recommendation = useRandomRecommendation();
  const googleLinkPrompt = useGoogleLinkPrompt();
  const [accountVisible, setAccountVisible] = useState(false);
  const [excludedRestaurantIds, setExcludedRestaurantIds] = useState<string[]>(
    [],
  );
  const [displayedResult, setDisplayedResult] =
    useState<RandomRecommendationResponse | null>(null);
  const [displayedSpinId, setDisplayedSpinId] = useState<string | null>(null);
  const [view, setView] = useState<DiscoveryView>('home');
  const [isSpinning, setIsSpinning] = useState(false);
  const requestedLocationOnMount = useRef(false);
  const requestInFlight = useRef(false);

  useEffect(() => {
    if (!requestedLocationOnMount.current) {
      requestedLocationOnMount.current = true;
      void requestLocation();
    }
  }, [requestLocation]);

  const requestRecommendation = async (isReroll: boolean) => {
    if (
      locationState.status !== 'granted' ||
      recommendation.isPending ||
      requestInFlight.current
    ) {
      return;
    }

    const previousResult = displayedResult;
    const exclusions = isReroll ? excludedRestaurantIds : [];
    const spinId = createTelemetryId();
    const startedAt = Date.now();
    requestInFlight.current = true;
    setIsSpinning(true);
    recommendation.reset();

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
      const result = await recommendation.recommend({
        ...locationState.coordinates,
        allowInternational: false,
        radiusMeters,
        candidatePoolId: isReroll
          ? previousResult?.candidatePool.id
          : undefined,
        excludedRestaurantIds: exclusions.length > 0 ? exclusions : undefined,
      });

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
        setDisplayedResult(result);
        setDisplayedSpinId(spinId);
        setView('result');
        googleLinkPrompt.recordSuccessfulSpin();
      }
    } catch (error) {
      trackProductEvent(TELEMETRY_EVENTS.spinFailed, {
        spinId,
        reroll: isReroll,
        radiusMeters,
        durationMs: Date.now() - startedAt,
        ...getTelemetryErrorProperties(error),
      });
      // TanStack Query retains the normalized error for the visible error state.
    } finally {
      requestInFlight.current = false;
      setIsSpinning(false);
    }
  };

  const handleRadiusChange = (nextRadiusMeters: number) => {
    if (nextRadiusMeters === radiusMeters || isSpinning) {
      return;
    }

    setRadiusMeters(nextRadiusMeters);
    setExcludedRestaurantIds([]);
    recommendation.reset();
  };

  const locationReady = locationState.status === 'granted';

  if (isSpinning) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <BrandHeader onAccountPress={() => setAccountVisible(true)} />
        <ScrollView contentContainerClassName="flex-grow" scrollEnabled={false}>
          <RouletteLoadingState />
        </ScrollView>
        <AccountModal
          onClose={() => setAccountVisible(false)}
          visible={accountVisible}
        />
      </SafeAreaView>
    );
  }

  if (view === 'result' && displayedResult) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <ScrollView contentContainerClassName="pb-4">
          <SessionRecoveryNotice />
          {recommendation.isError ? (
            <ErrorMessage
              message={getRecommendationErrorMessage(recommendation.error)}
            />
          ) : null}
          <RecommendationCard
            isRerolling={isSpinning}
            onBack={() => {
              recommendation.reset();
              setView('home');
            }}
            onMapsOpened={() => {
              if (displayedSpinId) {
                trackProductEvent(TELEMETRY_EVENTS.mapsOpened, {
                  restaurantId: displayedResult.recommendation.id,
                  spinId: displayedSpinId,
                });
              }
            }}
            onReroll={() => void requestRecommendation(true)}
            result={displayedResult}
          />
          {googleLinkPrompt.visible ? (
            <GoogleLinkPrompt onDismiss={googleLinkPrompt.dismiss} />
          ) : null}
        </ScrollView>
        <View className="absolute right-5 top-3 z-20">
          <AccountButton onPress={() => setAccountVisible(true)} />
        </View>
        <AccountModal
          onClose={() => setAccountVisible(false)}
          visible={accountVisible}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <BrandHeader
        onAccountPress={() => setAccountVisible(true)}
        showSettings
      />
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
          <RouletteSpinner spinning={false} />
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

        {recommendation.isError ? (
          <View className="mt-5">
            <ErrorMessage
              message={getRecommendationErrorMessage(recommendation.error)}
            />
          </View>
        ) : null}

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
        visible={accountVisible}
      />
    </SafeAreaView>
  );
}

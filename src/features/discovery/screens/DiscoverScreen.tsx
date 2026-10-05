import { AlertCircle, Settings, Sparkles } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RandomRecommendationResponse } from '@/api/contracts/recommendations';
import { Button } from '@/components/ui/Button';
import { LocationPill } from '@/features/discovery/components/LocationPill';
import { RadiusSelector } from '@/features/discovery/components/RadiusSelector';
import { RecommendationCard } from '@/features/discovery/components/RecommendationCard';
import { RouletteLoadingState } from '@/features/discovery/components/RouletteLoadingState';
import { RouletteSpinner } from '@/features/discovery/components/RouletteSpinner';
import { useCurrentLocation } from '@/features/discovery/hooks/useCurrentLocation';
import { useRandomRecommendation } from '@/features/discovery/hooks/useRandomRecommendation';
import { useDiscoveryStore } from '@/features/discovery/store/discovery.store';
import { getRecommendationErrorMessage } from '@/features/discovery/utils/getRecommendationErrorMessage';
import colors from '@/theme/colors.json';

type DiscoveryView = 'home' | 'result';

function BrandHeader({ showSettings = false }: { showSettings?: boolean }) {
  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <Text className="text-sm font-extrabold uppercase tracking-widest text-primary">
        Food Roulette
      </Text>
      {showSettings ? (
        <Pressable
          accessibilityLabel="Abrir ajustes de la aplicación"
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full bg-surfaceSecondary"
          onPress={() => void Linking.openSettings()}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Settings color={colors.foreground} size={21} />
        </Pressable>
      ) : (
        <View className="h-11" />
      )}
    </View>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <View className="mx-5 mb-4 flex-row gap-3 rounded-2xl bg-surface px-4 py-3">
      <AlertCircle color={colors.error} size={20} />
      <View className="flex-1">
        <Text className="font-bold text-error">No pudimos elegir un lugar</Text>
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
  const [excludedRestaurantIds, setExcludedRestaurantIds] = useState<string[]>(
    [],
  );
  const [displayedResult, setDisplayedResult] =
    useState<RandomRecommendationResponse | null>(null);
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
    requestInFlight.current = true;
    setIsSpinning(true);
    recommendation.reset();

    if (!isReroll) {
      setExcludedRestaurantIds([]);
    }

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
        setExcludedRestaurantIds([...exclusions, result.recommendation.id]);
        setDisplayedResult(result);
        setView('result');
      }
    } catch {
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
        <BrandHeader />
        <ScrollView contentContainerClassName="flex-grow" scrollEnabled={false}>
          <RouletteLoadingState />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === 'result' && displayedResult) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <ScrollView contentContainerClassName="pb-4">
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
            onReroll={() => void requestRecommendation(true)}
            result={displayedResult}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <BrandHeader showSettings />
      <ScrollView
        contentContainerClassName="px-5 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center pt-1">
          <Text className="text-center text-4xl font-black leading-tight text-foreground">
            ¿Qué vamos a{`\n`}comer? 🍴
          </Text>
          <Text className="mt-2 text-center text-base text-mutedForeground">
            Deja que el azar decida por ti.
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
          label="GIRAR RULETA"
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
              Necesitamos tu ubicación para buscar cerca de ti.
            </Text>
            {locationState.status === 'denied' ? (
              <Button
                label="ABRIR AJUSTES"
                onPress={() => void Linking.openSettings()}
                variant="secondary"
              />
            ) : null}
            <Button
              label="INTENTAR DE NUEVO"
              onPress={() => void requestLocation()}
              variant="secondary"
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

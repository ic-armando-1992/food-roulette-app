import colors from '@/theme/colors.json';

export const DISCOVERY_TIMING = {
  countryLookupTimeoutMs: 8_000,
  lastKnownLocationMaxAgeMs: 2 * 60 * 1_000,
  locationRequestTimeoutMs: 12_000,
  loadingMessageIntervalMs: 850,
  rouletteSpinDurationMs: 1_100,
} as const;

export const RADIUS_OPTIONS = [
  { label: '1 km', value: 1_000 },
  { label: '3 km', value: 3_000 },
  { label: '5 km', value: 5_000 },
  { label: '10 km', value: 10_000 },
] as const;

export const ROULETTE_APPEARANCE = {
  defaultSize: 292,
  foodIcons: ['🍕', '🌮', '🍣', '🍔', '🍜', '🥗', '🍗', '🥩'],
  hubRadiusRatio: 0.17,
  iconRadiusRatio: 0.31,
  maxSize: 320,
  minSize: 238,
  radiusRatio: 0.46,
  segmentColors: [
    colors.rouletteGold,
    colors.rouletteCream,
    colors.rouletteGreen,
    colors.rouletteCream,
    colors.rouletteGold,
    colors.rouletteCream,
    colors.rouletteGreen,
    colors.rouletteCream,
  ],
  segmentCount: 8,
} as const;

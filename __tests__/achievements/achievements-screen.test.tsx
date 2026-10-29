import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { PropsWithChildren } from 'react';
import { FlatList, PixelRatio } from 'react-native';
import {
  AchievementCatalog,
  UserAchievement,
  UserAchievements,
} from '@/api/contracts/achievements';
import {
  getAchievementCatalog,
  getMyAchievements,
} from '@/api/endpoints/achievements.api';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import {
  ACHIEVEMENT_CARD_HEIGHT,
  ACHIEVEMENT_GRID_BOTTOM_PADDING,
  ACHIEVEMENT_GRID_HORIZONTAL_PADDING,
  ACHIEVEMENT_GRID_TOP_PADDING,
  ACHIEVEMENT_INITIAL_RENDER_COUNT,
} from '@/features/achievements/constants/achievement.constants';
import { AchievementsScreen } from '@/features/achievements/screens/AchievementsScreen';
import { calculateAchievementCardWidth } from '@/features/achievements/utils/achievement-ui';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('@/api/endpoints/achievements.api', () => ({
  getAchievementCatalog: jest.fn(),
  getMyAchievements: jest.fn(),
}));

jest.mock('@/features/auth/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

const achievements: UserAchievement[] = Array.from(
  { length: 50 },
  (_, index) => ({
    id: `ACHIEVEMENT_${index}`,
    name:
      [
        'Primera vuelta',
        'El destino decide',
        'Segunda oportunidad',
        'Sin pensarlo dos veces',
      ][index] ?? `Achievement ${index}`,
    description: `Description ${index}`,
    category: index % 2 === 0 ? 'ROULETTE' : 'EXPLORATION',
    rarity: 'COMMON',
    isSecret: false,
    isEnabled: true,
    target: 10,
    xpReward: 25,
    rewardSpins: 0,
    assetKey: 'first_spin',
    assetVersion: '1',
    assetUrl: null,
    displayOrder: index,
    progress: index % 4 === 0 ? 10 : index % 10,
    unlockedAt: index % 4 === 0 ? '2026-10-25T12:00:00Z' : null,
  }),
);

const catalog: AchievementCatalog = {
  version: 'test',
  language: 'es-MX',
  achievements,
};

const mine: UserAchievements = {
  achievements,
  progression: {
    level: 4,
    currentLevel: 4,
    currentLevelXp: 120,
    requiredXpForNextLevel: 200,
    nextLevelXp: 600,
    xpRemaining: 80,
    progressPercentage: 60,
    totalXp: 520,
    maxConfiguredLevel: 50,
  },
};

describe('AchievementsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      beginGoogleAccountUpgrade: jest.fn(),
      confirmGoogleAccountSwitch: jest.fn(),
      dismissSessionRecoveryNotice: jest.fn(),
      logout: jest.fn(),
      retry: jest.fn(),
      sessionRecoveryNoticeVisible: false,
      status: 'ready',
      user: {
        id: '99999999-9999-4999-8999-999999999999',
        isGuest: true,
        displayName: null,
        avatarUrl: null,
        createdAt: '2026-10-25T00:00:00.000Z',
      },
    });
    jest.mocked(getAchievementCatalog).mockResolvedValue({
      catalog,
      etag: '"test"',
    });
    jest.mocked(getMyAchievements).mockResolvedValue(mine);
  });

  it('renders a bounded two-column collection and filters cached data', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: Infinity, retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const view = render(<AchievementsScreen />, { wrapper });

    fireEvent(
      await screen.findByTestId('achievements-list-viewport'),
      'layout',
      {
        nativeEvent: {
          layout: { height: 800, width: 400, x: 0, y: 0 },
        },
      },
    );
    expect(await screen.findByText('Nivel 4')).toBeOnTheScreen();
    expect(screen.getByText('13/50 logros')).toBeOnTheScreen();
    let list = screen.UNSAFE_getByType(FlatList<UserAchievement>);
    expect(list.props.numColumns).toBe(2);
    expect(list.props.initialNumToRender).toBe(
      ACHIEVEMENT_INITIAL_RENDER_COUNT,
    );
    expect(list.props.data).toHaveLength(50);
    const expectedCardWidth = calculateAchievementCardWidth(
      400,
      PixelRatio.get(),
    );
    const firstRowCells = [
      screen.getByTestId('achievement-grid-cell-ACHIEVEMENT_0'),
      screen.getByTestId('achievement-grid-cell-ACHIEVEMENT_1'),
    ];
    firstRowCells.forEach((cell) =>
      expect(cell).toHaveStyle({
        height: ACHIEVEMENT_CARD_HEIGHT,
        width: expectedCardWidth,
      }),
    );
    expect(screen.getByTestId('achievement-card-ACHIEVEMENT_0')).toHaveStyle({
      height: ACHIEVEMENT_CARD_HEIGHT,
      width: '100%',
    });
    expect(screen.getByTestId('achievement-card-ACHIEVEMENT_1')).toHaveStyle({
      height: ACHIEVEMENT_CARD_HEIGHT,
      width: '100%',
    });
    expect(list.props.columnWrapperStyle).toEqual({
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    });
    expect(list.props.contentContainerStyle).toEqual({
      paddingBottom: ACHIEVEMENT_GRID_BOTTOM_PADDING,
      paddingHorizontal: ACHIEVEMENT_GRID_HORIZONTAL_PADDING,
      paddingTop: ACHIEVEMENT_GRID_TOP_PADDING,
    });
    expect(screen.getByText('Sin pensarlo dos veces').props).toMatchObject({
      ellipsizeMode: 'tail',
      numberOfLines: 2,
    });
    expect(firstRowCells[0]).toHaveStyle({
      width: expectedCardWidth,
    });

    fireEvent.press(screen.getByText('Desbloqueados'));
    await waitFor(() => {
      list = screen.UNSAFE_getByType(FlatList<UserAchievement>);
      expect(list.props.data).toHaveLength(13);
    });
    expect(getMyAchievements).toHaveBeenCalledTimes(1);

    view.unmount();
    queryClient.clear();
  });
});

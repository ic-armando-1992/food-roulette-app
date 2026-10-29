import { fireEvent, render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import { UserAchievement } from '@/api/contracts/achievements';
import { AchievementCard } from '@/features/achievements/components/AchievementCard';
import { AchievementCelebration } from '@/features/achievements/components/AchievementCelebration';
import { AchievementDetail } from '@/features/achievements/components/AchievementDetail';
import { LevelUpCelebration } from '@/features/achievements/components/LevelUpCelebration';
import { ACHIEVEMENT_ASSETS } from '@/features/achievements/constants/achievement-assets';
import {
  ACHIEVEMENT_CARD_ART_CONTAINER_SIZE,
  ACHIEVEMENT_CARD_ART_SLOT_HEIGHT,
  ACHIEVEMENT_CARD_BOTTOM_PADDING,
  ACHIEVEMENT_CARD_HEIGHT,
  ACHIEVEMENT_CARD_HORIZONTAL_PADDING,
  ACHIEVEMENT_CARD_PROGRESS_HEIGHT,
  ACHIEVEMENT_CARD_RARITY_HEIGHT,
  ACHIEVEMENT_CARD_STATUS_HEIGHT,
  ACHIEVEMENT_CARD_TITLE_HEIGHT,
  ACHIEVEMENT_CARD_TITLE_TOP_PADDING,
  ACHIEVEMENT_CARD_TOP_PADDING,
} from '@/features/achievements/constants/achievement.constants';
import {
  ACHIEVEMENT_VISUAL_OVERRIDES,
  DEFAULT_ACHIEVEMENT_VISUAL_CONFIG,
  getAchievementVisualConfig,
} from '@/features/achievements/constants/achievement-visual-config';
import {
  buildAchievementFilterOptions,
  calculateAchievementCardWidth,
  filterAchievements,
} from '@/features/achievements/utils/achievement-ui';

const achievement: UserAchievement = {
  id: 'FIRST_SPIN',
  name: 'Primera vuelta',
  description: 'Primer giro válido',
  category: 'ROULETTE',
  rarity: 'COMMON',
  isSecret: false,
  isEnabled: true,
  target: 1,
  xpReward: 25,
  rewardSpins: 0,
  assetKey: 'first_spin',
  assetVersion: '1',
  assetUrl: null,
  displayOrder: 1,
  progress: 0,
  unlockedAt: null,
};

describe('Achievement UI', () => {
  it('registers every official image plus the locked fallback', () => {
    expect(Object.keys(ACHIEVEMENT_ASSETS)).toHaveLength(51);
    expect(ACHIEVEMENT_ASSETS.first_spin).toBeDefined();
    expect(ACHIEVEMENT_ASSETS.locked_achievement).toBeDefined();
  });

  it('renders pending progress and opens the selected achievement', () => {
    const onPress = jest.fn();
    render(<AchievementCard achievement={achievement} onPress={onPress} />);
    expect(screen.getByText('Primera vuelta')).toBeOnTheScreen();
    expect(screen.getByText('0 / 1')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledWith(achievement);
  });

  it('uses deterministic card dimensions for stable two-column rows', () => {
    render(<AchievementCard achievement={achievement} onPress={jest.fn()} />);
    const card = screen.getByRole('button');
    expect(card).toHaveStyle({
      height: ACHIEVEMENT_CARD_HEIGHT,
      paddingBottom: ACHIEVEMENT_CARD_BOTTOM_PADDING,
      paddingHorizontal: ACHIEVEMENT_CARD_HORIZONTAL_PADDING,
      paddingTop: ACHIEVEMENT_CARD_TOP_PADDING,
      width: '100%',
    });
    expect(screen.getByTestId('achievement-art-container')).toHaveStyle({
      height: ACHIEVEMENT_CARD_ART_CONTAINER_SIZE,
      width: ACHIEVEMENT_CARD_ART_CONTAINER_SIZE,
    });
  });

  it('calculates both columns from the measured list viewport in physical pixels', () => {
    expect(calculateAchievementCardWidth(360, 3)).toBe(154);
    expect(calculateAchievementCardWidth(411, 3)).toBeCloseTo(179.333, 3);
    expect(calculateAchievementCardWidth(0, 3)).toBe(0);
  });

  it('keeps every card and internal zone identical across content and states', () => {
    const fixtures: UserAchievement[] = [
      achievement,
      {
        ...achievement,
        id: 'DESTINY_DECIDES',
        name: 'El destino decide',
        rarity: 'RARE',
        progress: 10,
        target: 10,
        unlockedAt: '2026-10-25T12:00:00Z',
      },
      {
        ...achievement,
        id: 'SECOND_CHANCE',
        name: 'Segunda oportunidad',
        progress: 4,
        rarity: 'EPIC',
        target: 25,
      },
      {
        ...achievement,
        id: 'WITHOUT_THINKING_TWICE',
        name: 'Sin pensarlo dos veces',
        progress: 100,
        rarity: 'LEGENDARY',
        target: 100,
        unlockedAt: '2026-10-25T12:00:00Z',
      },
    ];

    render(
      <View>
        {fixtures.map((fixture) => (
          <AchievementCard
            achievement={fixture}
            key={fixture.id}
            onPress={jest.fn()}
          />
        ))}
      </View>,
    );

    fixtures.forEach((fixture) => {
      expect(screen.getByTestId(`achievement-card-${fixture.id}`)).toHaveStyle({
        height: ACHIEVEMENT_CARD_HEIGHT,
        width: '100%',
      });
      expect(screen.getAllByTestId('achievement-art-container')).toHaveLength(
        fixtures.length,
      );
      expect(
        screen.getByTestId(`achievement-card-title-${fixture.id}`),
      ).toHaveStyle({
        height: ACHIEVEMENT_CARD_TITLE_HEIGHT,
        justifyContent: 'flex-start',
        overflow: 'hidden',
        paddingTop: ACHIEVEMENT_CARD_TITLE_TOP_PADDING,
      });
      expect(
        screen.getByTestId(`achievement-card-rarity-${fixture.id}`),
      ).toHaveStyle({ height: ACHIEVEMENT_CARD_RARITY_HEIGHT });
      expect(
        screen.getByTestId(`achievement-card-progress-${fixture.id}`),
      ).toHaveStyle({ height: ACHIEVEMENT_CARD_PROGRESS_HEIGHT });
      expect(
        screen.getByTestId(`achievement-card-status-${fixture.id}`),
      ).toHaveStyle({ height: ACHIEVEMENT_CARD_STATUS_HEIGHT });
    });
    expect(
      screen.getByTestId(`achievement-card-title-${achievement.id}`),
    ).toHaveStyle({ height: ACHIEVEMENT_CARD_TITLE_HEIGHT });
    expect(screen.getAllByTestId('achievement-art-container')[0]).toHaveStyle({
      height: ACHIEVEMENT_CARD_ART_CONTAINER_SIZE,
      width: ACHIEVEMENT_CARD_ART_CONTAINER_SIZE,
    });
    expect(ACHIEVEMENT_CARD_ART_SLOT_HEIGHT).toBe(
      ACHIEVEMENT_CARD_ART_CONTAINER_SIZE,
    );

    const longTitle = screen.getByText('Sin pensarlo dos veces');
    expect(longTitle.props.numberOfLines).toBe(2);
    expect(longTitle.props.ellipsizeMode).toBe('tail');
  });

  it('centralizes bounded visual corrections for measured asset outliers', () => {
    expect(getAchievementVisualConfig('first_reroll')).toEqual({
      scale: 1.13,
      translateX: 0,
      translateY: -0.5,
    });
    expect(getAchievementVisualConfig('thirty_trophies').scale).toBe(0.96);
    expect(getAchievementVisualConfig('asset_without_override')).toBe(
      DEFAULT_ACHIEVEMENT_VISUAL_CONFIG,
    );
    expect(
      Object.keys(ACHIEVEMENT_VISUAL_OVERRIDES).every(
        (assetKey) => ACHIEVEMENT_ASSETS[assetKey],
      ),
    ).toBe(true);
    expect(
      Object.values(ACHIEVEMENT_VISUAL_OVERRIDES).every(
        ({ scale }) => scale >= 0.96 && scale <= 1.13,
      ),
    ).toBe(true);

    render(
      <AchievementCard
        achievement={{ ...achievement, assetKey: 'first_reroll' }}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByLabelText('Primera vuelta')).toHaveStyle({
      transform: [{ translateX: 0 }, { translateY: -0.5 }, { scale: 1.13 }],
    });
  });

  it('conceals only locked secret achievements in the UI', () => {
    const lockedSecret: UserAchievement = {
      ...achievement,
      assetKey: 'midnight_craving',
      description: 'Accept at midnight',
      id: 'MIDNIGHT_CRAVING',
      isSecret: true,
      name: 'Hambre de medianoche',
      progress: null,
      target: 1,
    };
    const { rerender } = render(
      <AchievementCard achievement={lockedSecret} onPress={jest.fn()} />,
    );
    expect(screen.getByText('Logro secreto')).toBeOnTheScreen();
    expect(screen.queryByText('Hambre de medianoche')).not.toBeOnTheScreen();

    rerender(
      <AchievementCard
        achievement={{
          ...lockedSecret,
          progress: 1,
          unlockedAt: '2026-10-25T12:00:00Z',
        }}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText('Hambre de medianoche')).toBeOnTheScreen();
  });

  it('does not reveal a locked secret condition in its detail', () => {
    render(
      <AchievementDetail
        achievement={{
          ...achievement,
          description: 'Accept at midnight',
          id: 'MIDNIGHT_CRAVING',
          isSecret: true,
          name: 'Hambre de medianoche',
          progress: null,
          target: 1,
        }}
        onClose={jest.fn()}
      />,
    );

    expect(
      screen.getByText('Sigue explorando para descubrir este logro.'),
    ).toBeOnTheScreen();
    expect(screen.queryByText('Accept at midnight')).not.toBeOnTheScreen();
    expect(screen.getByText('Logro secreto')).toBeOnTheScreen();
  });

  it('builds unique cached filters and filters 100 items without mutation', () => {
    const achievements = Array.from({ length: 100 }, (_, index) => ({
      ...achievement,
      category:
        index % 3 === 0
          ? 'SECRET'
          : index % 2 === 0
            ? 'EXPLORATION'
            : 'ROULETTE',
      id: `ACHIEVEMENT_${index}`,
      isSecret: index % 3 === 0,
      unlockedAt: index % 4 === 0 ? '2026-10-25T12:00:00Z' : null,
    }));
    const options = buildAchievementFilterOptions(achievements);

    expect(new Set(options.map((option) => option.key)).size).toBe(
      options.length,
    );
    expect(options.filter((option) => option.key === 'SECRET')).toHaveLength(1);
    expect(filterAchievements(achievements, 'UNLOCKED')).toHaveLength(25);
    expect(
      filterAchievements(achievements, 'CATEGORY:EXPLORATION'),
    ).toHaveLength(33);
    expect(achievements).toHaveLength(100);
  });

  it('shows one celebration and exposes both queue actions', () => {
    const onContinue = jest.fn();
    const onViewAchievements = jest.fn();
    render(
      <AchievementCelebration
        notification={{
          notificationId: '11111111-1111-4111-8111-111111111111',
          achievement: {
            ...achievement,
            progress: 1,
            unlockedAt: '2026-10-25T12:00:00Z',
          },
          createdAt: '2026-10-25T12:00:00Z',
        }}
        onContinue={onContinue}
        onViewAchievements={onViewAchievements}
      />,
    );
    expect(screen.getByText('¡Logro desbloqueado!')).toBeOnTheScreen();
    expect(screen.getByText('+25 XP')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Continuar'));
    fireEvent.press(screen.getByText('Ver mis logros'));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onViewAchievements).toHaveBeenCalledTimes(1);
  });

  it('summarizes a multi-level jump in one celebration', () => {
    const onContinue = jest.fn();
    render(
      <LevelUpCelebration
        notification={{
          notificationId: '22222222-2222-4222-8222-222222222222',
          fromLevel: 2,
          toLevel: 5,
          xpAwarded: 450,
          createdAt: '2026-10-25T12:00:00Z',
        }}
        onContinue={onContinue}
        onViewAchievements={jest.fn()}
      />,
    );
    expect(screen.getByText('¡Subiste de nivel!')).toBeOnTheScreen();
    expect(screen.getByText('Nivel 5')).toBeOnTheScreen();
    expect(
      screen.getByText('Avanzaste 3 niveles en una sola jugada'),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByText('CONTINUAR'));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});

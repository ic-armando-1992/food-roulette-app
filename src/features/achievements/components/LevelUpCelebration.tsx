import { Sparkles, Star } from 'lucide-react-native';
import { Modal, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  ReduceMotion,
  ZoomIn,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import colors from '@/theme/colors.json';
import { LevelUpCelebrationProps } from '../types/achievement.types';

export function LevelUpCelebration({
  notification,
  onContinue,
  onViewAchievements,
}: LevelUpCelebrationProps) {
  if (!notification) return null;
  const gained = notification.toLevel - notification.fromLevel;
  return (
    <Modal animationType="fade" onRequestClose={onContinue} transparent visible>
      <Animated.View
        className="flex-1 items-center justify-center bg-black/45 px-6"
        entering={FadeIn.duration(180).reduceMotion(ReduceMotion.System)}
      >
        <Animated.View
          className="w-full max-w-md items-center overflow-hidden rounded-[36px] bg-background px-6 pb-7 pt-8"
          entering={ZoomIn.springify()
            .damping(13)
            .reduceMotion(ReduceMotion.System)}
        >
          <View className="absolute inset-x-0 top-0 h-2 bg-rouletteGold" />
          <Sparkles color={colors.rouletteGold} size={34} />
          <Text className="mt-3 text-center text-sm font-black uppercase tracking-widest text-primary">
            ¡Subiste de nivel!
          </Text>
          <View className="mt-5 h-32 w-32 items-center justify-center rounded-full bg-rouletteCream">
            <Star color={colors.primary} fill={colors.rouletteGold} size={48} />
            <Text className="mt-1 text-4xl font-black text-foreground">
              {notification.toLevel}
            </Text>
          </View>
          <Text className="mt-5 text-center text-3xl font-black text-foreground">
            Nivel {notification.toLevel}
          </Text>
          {gained > 1 ? (
            <Text className="mt-2 text-center text-sm font-bold text-mutedForeground">
              Avanzaste {gained} niveles en una sola jugada
            </Text>
          ) : null}
          <Text className="mt-3 text-center font-bold text-primary">
            +{notification.xpAwarded} XP en esta operación
          </Text>
          <View className="mt-7 w-full gap-3">
            <Button label="CONTINUAR" onPress={onContinue} />
            <Button
              label="VER PROGRESO"
              onPress={onViewAchievements}
              variant="secondary"
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

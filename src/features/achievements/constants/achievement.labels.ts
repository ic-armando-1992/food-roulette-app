export const ACHIEVEMENT_LABELS = {
  title: 'Mis logros',
  subtitle: 'Cada descubrimiento cuenta.',
  level: (level: number) => `Nivel ${level}`,
  totalXp: (xp: number) => `${xp.toLocaleString()} XP totales`,
  unlockedCount: (unlocked: number, total: number) =>
    `${unlocked} de ${total} desbloqueados`,
  unlockedCountCompact: (unlocked: number, total: number) =>
    `${unlocked}/${total} logros`,
  xpProgress: (current: number, required: number) =>
    `${current.toLocaleString()} / ${required.toLocaleString()} XP`,
  xpRemaining: (xp: number) => `${xp.toLocaleString()} XP para subir`,
  maximumLevel: 'Nivel máximo configurado',
  xpReward: (xp: number) => `+${xp} XP`,
  progress: (progress: number, target: number) => `${progress} / ${target}`,
  locked: 'Pendiente',
  unlocked: 'Desbloqueado',
  disabled: 'Próximamente',
  unlockedOn: (date: string) => `Desbloqueado el ${date}`,
  secretRequirement: 'El requisito se revelará al desbloquearlo.',
  celebrationTitle: '¡Logro desbloqueado!',
  continue: 'Continuar',
  viewAchievements: 'Ver mis logros',
  filters: {
    all: 'Todos',
    unlocked: 'Desbloqueados',
    pending: 'Pendientes',
    secret: 'Secretos',
  },
  categories: {
    ROULETTE: 'Ruleta',
    EXPLORATION: 'Exploración',
    CONSISTENCY: 'Constancia',
    ADVENTURE: 'Aventura',
    COLLECTION: 'Colección',
  },
  rarity: {
    COMMON: 'Común',
    RARE: 'Raro',
    EPIC: 'Épico',
    LEGENDARY: 'Legendario',
  },
  error: {
    load: 'No pudimos cargar tus logros.',
    refresh: 'No pudimos actualizar. Conservamos tu última copia disponible.',
    empty: 'Aún no hay logros disponibles.',
    emptyFilter: 'No hay logros que coincidan con este filtro.',
  },
  actions: {
    retry: 'Reintentar',
  },
  secret: {
    name: 'Logro secreto',
    description: 'Sigue explorando para descubrir este logro.',
  },
  accessibility: {
    back: 'Volver',
    closeDetail: 'Cerrar detalle',
    collection: 'Abrir mis logros',
    list: 'Colección de logros',
    dismissCelebration: 'Continuar al siguiente logro',
  },
} as const;

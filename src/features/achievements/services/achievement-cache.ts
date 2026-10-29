import Storage from 'expo-sqlite/kv-store';
import {
  AchievementCatalog,
  UserAchievements,
} from '@/api/contracts/achievements';
import { ACHIEVEMENT_CACHE_KEYS } from '../constants/achievement.constants';
import { CelebrationQueueItem } from '../types/achievement.types';

async function readJson<T>(key: string): Promise<T | null> {
  const value = await Storage.getItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    await Storage.removeItem(key);
    return null;
  }
}

export function readCachedCatalog(): Promise<AchievementCatalog | null> {
  return readJson(ACHIEVEMENT_CACHE_KEYS.catalog);
}

export async function writeCachedCatalog(
  catalog: AchievementCatalog,
  etag: string | null,
): Promise<void> {
  await Storage.setItem(
    ACHIEVEMENT_CACHE_KEYS.catalog,
    JSON.stringify(catalog),
  );
  if (etag) await Storage.setItem(ACHIEVEMENT_CACHE_KEYS.catalogEtag, etag);
}

export function readCatalogEtag(): Promise<string | null> {
  return Storage.getItem(ACHIEVEMENT_CACHE_KEYS.catalogEtag);
}

export function readCachedUserAchievements(
  userId: string,
): Promise<UserAchievements | null> {
  return readJson(ACHIEVEMENT_CACHE_KEYS.me(userId));
}

export function writeCachedUserAchievements(
  userId: string,
  achievements: UserAchievements,
): Promise<void> {
  return Storage.setItem(
    ACHIEVEMENT_CACHE_KEYS.me(userId),
    JSON.stringify(achievements),
  );
}

export function readCachedNotifications(
  userId: string,
): Promise<CelebrationQueueItem[] | null> {
  return readJson(ACHIEVEMENT_CACHE_KEYS.notifications(userId));
}

export function writeCachedNotifications(
  userId: string,
  notifications: CelebrationQueueItem[],
): Promise<void> {
  return Storage.setItem(
    ACHIEVEMENT_CACHE_KEYS.notifications(userId),
    JSON.stringify(notifications),
  );
}

export async function clearPrivateAchievementCache(
  userId: string,
): Promise<void> {
  await Promise.all([
    Storage.removeItem(ACHIEVEMENT_CACHE_KEYS.me(userId)),
    Storage.removeItem(ACHIEVEMENT_CACHE_KEYS.notifications(userId)),
  ]);
}

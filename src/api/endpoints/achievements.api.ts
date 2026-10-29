import {
  AchievementCatalog,
  AchievementNotifications,
  AchievementProgression,
  ProgressionNotifications,
  AchievementSummary,
  UserAchievements,
} from '@/api/contracts/achievements';
import { apiRequest, getApiResourceUrl } from '@/api/client';

export async function getAchievementCatalog(
  etag?: string | null,
): Promise<{ catalog: AchievementCatalog | null; etag: string | null }> {
  const url = getApiResourceUrl('/v1/achievements/catalog');
  if (!url) throw new Error('configuration');
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(etag ? { 'If-None-Match': etag } : {}),
    },
  });
  if (response.status === 304) return { catalog: null, etag: etag ?? null };
  if (!response.ok) throw new Error(`http-${response.status}`);
  return {
    catalog: (await response.json()) as AchievementCatalog,
    etag: response.headers.get('etag'),
  };
}

export function getMyAchievements(): Promise<UserAchievements> {
  return apiRequest<UserAchievements>('/v1/achievements/me', {
    auth: 'required',
  });
}

export function getAchievementSummary(): Promise<AchievementSummary> {
  return apiRequest<AchievementSummary>('/v1/achievements/me/summary', {
    auth: 'required',
  });
}

export function getUnseenAchievements(): Promise<AchievementNotifications> {
  return apiRequest<AchievementNotifications>('/v1/achievements/me/unseen', {
    auth: 'required',
  });
}

export function acknowledgeAchievements(
  notificationIds: string[],
): Promise<void> {
  return apiRequest<void>('/v1/achievements/me/acknowledge', {
    auth: 'required',
    body: { notificationIds },
    method: 'POST',
  });
}

export function getMyProgression(): Promise<AchievementProgression> {
  return apiRequest<AchievementProgression>('/v1/users/me/progression', {
    auth: 'required',
  });
}

export function getUnseenProgression(): Promise<ProgressionNotifications> {
  return apiRequest<ProgressionNotifications>(
    '/v1/users/me/progression/unseen',
    { auth: 'required' },
  );
}

export function acknowledgeProgression(
  notificationIds: string[],
): Promise<void> {
  return apiRequest<void>('/v1/users/me/progression/acknowledge', {
    auth: 'required',
    body: { notificationIds },
    method: 'POST',
  });
}

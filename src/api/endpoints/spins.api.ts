import { apiRequest } from '@/api/client';

export function markSpinMapsOpened(spinId: string): Promise<void> {
  return apiRequest<void>(`/v1/spins/${spinId}/maps-opened`, {
    auth: 'required',
    method: 'PUT',
  });
}

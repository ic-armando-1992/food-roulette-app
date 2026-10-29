import { apiRequest } from '@/api/client';
import { XpOperationResult } from '@/api/contracts/achievements';

export function markSpinMapsOpened(spinId: string): Promise<XpOperationResult> {
  return apiRequest<XpOperationResult>(`/v1/spins/${spinId}/maps-opened`, {
    auth: 'required',
    method: 'PUT',
  });
}

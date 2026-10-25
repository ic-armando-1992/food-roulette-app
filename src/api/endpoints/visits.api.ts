import { apiRequest } from '@/api/client';
import {
  CheckInRequest,
  CheckInResponse,
  VisitHistoryResponse,
} from '@/api/contracts/visits';

export function checkIn(request: CheckInRequest): Promise<CheckInResponse> {
  return apiRequest<CheckInResponse>('/v1/visits/check-in', {
    auth: 'required',
    body: request,
    method: 'POST',
  });
}

export function getVisits(): Promise<VisitHistoryResponse> {
  return apiRequest<VisitHistoryResponse>('/v1/visits', {
    auth: 'required',
  });
}

export type ApiErrorKind =
  'configuration' | 'http' | 'invalid-response' | 'network' | 'timeout';

export type PublicApiErrorCode = 'GOOGLE_IDENTITY_CONFLICT';

export type ApiRequestOptions = {
  auth?: 'none' | 'optional' | 'required';
  body?: unknown;
  method?: 'DELETE' | 'GET' | 'POST' | 'PUT';
  signal?: AbortSignal;
  timeoutMs?: number;
};

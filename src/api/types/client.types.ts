export type ApiErrorKind =
  'configuration' | 'http' | 'invalid-response' | 'network' | 'timeout';

export type ApiRequestOptions = {
  body?: unknown;
  method?: 'GET' | 'POST';
  signal?: AbortSignal;
  timeoutMs?: number;
};

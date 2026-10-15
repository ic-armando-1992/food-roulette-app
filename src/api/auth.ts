type RefreshAccessToken = () => Promise<string | null>;

let accessToken: string | null = null;
let refreshAccessToken: RefreshAccessToken = async () => null;
let refreshInFlight: Promise<string | null> | null = null;

export function getApiAccessToken(): string | null {
  return accessToken;
}

export function setApiAccessToken(token: string | null): void {
  accessToken = token;
}

export function configureApiTokenRefresh(refresh: RefreshAccessToken): void {
  refreshAccessToken = refresh;
}

export async function refreshApiAccessToken(): Promise<string | null> {
  refreshInFlight ??= refreshAccessToken().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

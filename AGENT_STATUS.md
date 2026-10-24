# Agent Status

## Current phase

Roadmap Phases 0 and 1 and the Android-targeted Phase 2 guest/Google account
path are integrated into `experimental`. Google upgrade, verified profile,
account-entry UX and session persistence/logout are merged. The integrated
discovery flow keeps the roulette rotating continuously for the longer of two
seconds or the recommendation request, then decelerates before revealing the
outcome. The home roulette is directly interactive by tap or a deliberate
one-finger circular gesture and reuses the same guarded recommendation flow as
the button. Sign in with Apple remains before the iOS release when applicable;
Phase 3 has not started.

## Current branch

`experimental` after App PR #9.

## Current environment status

Expo SDK 57.0.31, React Native 0.86.3 and Node.js 20.20.2 are active. Format,
lint and strict typecheck pass; all 21 suites/138 tests and an Android Hermes
export pass. The configured Google first-link flow previously passed on a Pixel
emulator, and the account/session work passed an ARM64 Android development
build. The development build now launches on a physical SM-S948B through a
USB-forwarded Metro connection. The developer completed physical Android
validation, including the API-backed roulette flow and latest spinner
transition. Native iOS validation has not run on this Linux/WSL host.
The developer also confirmed the direct tap/circular roulette interaction and
request-action lock on that physical device.

## Completed milestones

- Phase 0 discovery and Phase 1 telemetry behavior remain covered and green.
- A cryptographic guest credential is created once and stored in Expo
  SecureStore with the rotating refresh token; access remains memory-only.
- Startup restores or creates the guest identity without gating the roulette.
- The API client attaches bearer credentials centrally, coordinates refresh and
  retries a rejected authenticated request once.
- A revoked refresh can recover the same guest through its stored installation
  credential; network failure preserves that identity for later retry.
- App PR #3 and its API dependency are merged into `experimental`.
- Phase 2 closeout-hygiene PR #4 synchronizes integration status and the latest
  compatible Expo SDK 57 patches.
- The native Google Credential Manager/Google Sign-In SDK is wired through an
  official branded button and sends only its ID token to the API.
- Verified Google display name and avatar from the API are rendered with a safe
  visual fallback when either field is absent or an image cannot load.
- A stable 409 produces an explicit cancel/switch dialog. Cancel leaves the
  guest untouched; confirm activates returned target tokens only after success.
- API error details remain hidden except for the allowlisted conflict code and
  opaque confirmation token.
- Account access now lives beside Settings; the home registration card is
  removed and a persisted, non-blocking invitation appears only after the first
  successful guest spin.
- Long-date formatting is a locale-aware shared core utility with direct unit
  coverage; auth- and discovery-specific state handlers remain feature-local.
- Google sessions restore transparently from rotating SecureStore credentials;
  startup and reactive refreshes are coordinated, while transient network
  failures preserve the valid stored identity.
- Confirmed logout revokes only the current API session when reachable, clears
  local credentials/private query state, creates a fresh guest and prevents
  older refresh/link operations from restoring the previous account.
- Definitively invalid sessions recover as guest and show a dismissible account
  recovery notice without invoking Google automatically.
- Every initial spin and reroll keeps the roulette rotating at a constant speed
  for at least two seconds and for as long as the recommendation request is
  pending, then runs a 700 ms ease-out stop before showing the result or error.
- The idle home roulette starts that same flow when tapped or rotated at least
  60 degrees around its outer area; center-crossing drags are ignored and the
  control remains disabled until location is ready.
- Starting a spin synchronously closes the account sheet; throughout spinning
  and stopping, the account entry and every other request-producing discovery
  action are unavailable while the in-flight guard rejects duplicate events.

## Active blocker(s)

No local Android implementation blocker. The continuous spinner, API-backed
flow, direct touch/circular gesture and request-action lock are physically
validated. App PR #9 passed CI and is merged into `experimental`, including the
required same-SDK Expo patch alignment. Sign in with Apple and native iOS
validation remain before the iOS release.

## Important current decisions

- Guest authentication is background infrastructure and never a precondition
  for using the roulette.
- SecureStore is the only persistent mobile credential store; AsyncStorage and
  SQLite do not hold auth credentials.
- Provider subjects and profiles come only from API-verified credentials. The
  client never declares authoritative identity data or displays raw errors.
- Android package and iOS bundle identifiers are both `com.foodroulette.app`;
  Google OAuth clients must be registered against that stable identifier.
- Account UI uses the repository's NativeWind design system rather than adding
  Tamagui. It renders API-verified Google profile fields and falls back safely
  when a name/avatar is absent or an image fails.
- Existing Google accounts require explicit confirmation and remain principal;
  no silent merge occurs. Future giro transfer rules live in Phase 8.
- Session policy remains the documented 15-minute access token and rotating
  30-day inactivity window. A proposed 90-day window or absolute lifetime is a
  separate product/architecture decision and was not changed implicitly.
- Roulette rotation has a two-second minimum that runs concurrently with the
  backend request. Once both are complete, a separate ease-out phase stops the
  wheel before the outcome becomes visible.
- Tapping or deliberately rotating the home roulette is an alternate input for
  the existing guarded initial-spin action, not a separate API or state path.
  Circular input must stay outside the hub to reduce accidental activation
  while scrolling.
- No secondary authentication request may begin from discovery while a
  recommendation spin is active; purely visual loading UI remains noninteractive.
- Apple upgrade and Phase 2 closeout remain; Phase 3 has not started.

## Next intended action

Perform the final cross-repository Phase 2 closeout. Do not begin Phase 3
automatically.

# Agent Status

## Current phase

Roadmap Phases 0 and 1 and the Phase 2 guest foundation are integrated into
`experimental`. Phase 2 remains active: the native Google account-upgrade and
its dependent account-entry UX plus session persistence/logout increment are
implemented on focused stacked branches. Publication/merge remains pending.
Phase 3 has not started.

## Current branch

`feature/phase-2-auth-persistence-logout`, created from the locally verified
`feature/phase-2-account-entry-ux` dependency.

## Current environment status

Expo SDK 57.0.30, React Native 0.86.3 and Node.js 20.20.2 are active. The stacked
Google/account/logout work passes format, lint, strict typecheck, 19 suites/124
tests and an ARM64 Android development build. The configured Google first-link
flow previously passed on a Pixel emulator. Physical Android and native iOS
validation have not run on this Linux/WSL host.

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

## Active blocker(s)

No implementation blocker. Manual physical-device validation still requires a
connected Android phone and a LAN-reachable API address; the current local App
environment remains configured for the Android emulator. The existing auth API
does not expose verified display name/avatar fields, so authenticated account UI
uses the required fallback. Native iOS still requires macOS. Publication is
blocked because GitHub CLI tokens are invalid and the personal SSH key is not
loaded.

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
  Tamagui. The Google avatar remains a fallback until a roadmap-approved API
  contract exposes verified profile data.
- Existing Google accounts require explicit confirmation and remain principal;
  no silent merge occurs. Future giro transfer rules live in Phase 8.
- Session policy remains the documented 15-minute access token and rotating
  30-day inactivity window. A proposed 90-day window or absolute lifetime is a
  separate product/architecture decision and was not changed implicitly.
- Apple upgrade and Phase 2 closeout remain; Phase 3 has not started.

## Next intended action

Restore GitHub CLI/SSH authentication, publish and merge the API and stacked App
Google-upgrade/account/logout PRs in dependency order, wait for CI and merge
them into `experimental` under the existing authorization. Then run the
documented Android physical-device checklist. Do not begin Phase 3 automatically.

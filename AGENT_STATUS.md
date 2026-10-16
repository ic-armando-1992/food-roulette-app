# Agent Status

## Current phase

Roadmap Phases 0 and 1 and the Phase 2 guest foundation are integrated into
`experimental`. Phase 2 remains active: the native Google account-upgrade is
locally verified and its dependent account-entry UX increment is implemented
on a focused stacked branch. Publication/merge remains pending. Phase 3 has not
started.

## Current branch

`feature/phase-2-account-entry-ux`, created from the locally verified
`feature/phase-2-google-account-upgrade` dependency.

## Current environment status

Expo SDK 57.0.30, React Native 0.86.3 and Node.js 20.20.2 are active. The stacked
Google/account UX work passes format, lint, strict typecheck, 19 suites/110
tests and Android Hermes export. The native Android build and configured Google
first-link flow pass on a Pixel emulator. Native iOS builds remain unavailable
on this Linux/WSL host.

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

## Active blocker(s)

No implementation blocker. The existing auth API does not expose verified
display name/avatar fields, so authenticated account UI correctly uses the
required profile fallback without changing the contract. Native iOS validation
still requires macOS. Publication is blocked because GitHub CLI tokens are
invalid and the personal SSH key is not loaded.

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
- Apple upgrade and Phase 2 closeout remain; Phase 3 has not started.

## Next intended action

Restore GitHub CLI/SSH authentication, publish and merge the API and base App
Google-upgrade dependencies, then publish this focused App PR to
`experimental`, wait for CI and merge it under the existing authorization. Do
not begin Phase 3 automatically.

# Agent Status

## Current phase

Roadmap Phases 0 and 1 and the Phase 2 guest foundation are integrated into
`experimental`. Phase 2 remains active: the native Google account-upgrade and
explicit conflict dialog are implemented and locally verified, pending the API
dependency and authorized publication/merge. Phase 3 has not started.

## Current branch

`feature/phase-2-google-account-upgrade`, created from synchronized
`experimental` after Phase 2 closeout-hygiene PR #4.

## Current environment status

Expo SDK 57.0.30, React Native 0.86.3 and Node.js 20.20.2 are active. The Google
increment passes a reproducible install, format, lint, strict typecheck, 17
suites/96 tests, Expo configuration/dependency checks, Android Hermes export
and a full Android Gradle debug compile. The critical audit threshold passes;
known noncritical transitive advisories require breaking Expo/Jest/Tailwind
changes. Native iOS builds remain unavailable on this Linux/WSL host.

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

## Active blocker(s)

No implementation blocker. Live validation needs configured Google Web,
Android and iOS OAuth clients plus a custom native build; Expo Go cannot load
the native provider module. Native iOS validation additionally requires macOS
and a physical iOS device before release.

## Important current decisions

- Guest authentication is background infrastructure and never a precondition
  for using the roulette.
- SecureStore is the only persistent mobile credential store; AsyncStorage and
  SQLite do not hold auth credentials.
- Provider subjects and profiles come only from API-verified credentials. The
  client never declares authoritative identity data or displays raw errors.
- Android package and iOS bundle identifiers are both `com.foodroulette.app`;
  Google OAuth clients must be registered against that stable identifier.
- Existing Google accounts require explicit confirmation and remain principal;
  no silent merge occurs. Future giro transfer rules live in Phase 8.
- Apple upgrade and Phase 2 closeout remain; Phase 3 has not started.

## Next intended action

After the API dependency merges, commit and publish the verified increment,
open its authorized App PR, wait for CI and merge it into `experimental`. Do not
begin Phase 3 automatically.

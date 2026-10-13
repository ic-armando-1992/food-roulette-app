# Agent Status

## Current phase

Roadmap Phases 0 and 1 are complete and integrated into `experimental` through
PRs #1 and #2. Phase 2 is active. Its first reviewable increment implements
steps 1--3: the identity/security contract, API guest identity foundation and
non-blocking mobile guest bootstrap. Phase 3 has not started.

## Current branch

`feature/phase-2-guest-identity`, created from synchronized `experimental` at
merge commit `74294a8` and published through PR #3.

## Current environment status

Expo SDK 57.0.28, React Native 0.86.3 and Node.js 20.20.2 remain active. The app
passes reproducible install, format, lint, strict typecheck, 15 suites/76 tests,
Expo dependency validation, Doctor 21/21 and Android Hermes export. Native iOS
builds remain unavailable on this Linux/WSL host. GitHub Actions run
`38351620164` passed for the implementation commit.

## Completed milestones

- Phase 0 discovery and Phase 1 telemetry behavior remain covered and green.
- A cryptographic guest credential is created once and stored in Expo
  SecureStore with the rotating refresh token; access remains memory-only.
- Startup restores or creates the guest identity without gating the roulette.
- The API client attaches bearer credentials centrally, coordinates refresh and
  retries a rejected authenticated request once.
- A revoked refresh can recover the same guest through its stored installation
  credential; network failure preserves that identity for later retry.

## Active blocker(s)

The next account-upgrade UI needs an explicit product decision for a verified
Google/Apple identity already owned by another internal user; no data may be
silently merged or discarded. Native Apple sign-in validation additionally
requires macOS and a physical iOS device before release.

## Important current decisions

- Guest authentication is background infrastructure and never a precondition
  for using the roulette.
- SecureStore is the only persistent mobile credential store; AsyncStorage and
  SQLite do not hold auth credentials.
- Provider subjects and profiles will come only from API-verified provider
  credentials. The client never declares authoritative identity data.
- Google/Apple UI and Phase 3 functionality are excluded from this first
  increment.

## Next intended action

Review API PR #3 before this dependent App PR #3. Obtain the conflict-handling
decision before Phase 2 provider upgrades; do not merge or begin Phase 3
automatically.

# Agent Status

## Current phase

Roadmap Phases 0 and 1 and the first Phase 2 increment are integrated into
`experimental` through PRs #1--#3. Phase 2 remains active: steps 1--3 provide
the identity/security contract, API guest identity foundation and non-blocking
mobile guest bootstrap. Phase 3 has not started.

## Current branch

`fix/phase-2-closeout-hygiene`, created from `experimental` at Phase 2 merge
commit `ea9fbfd` to synchronize project status with the integrated increment.

## Current environment status

Expo SDK 57.0.30, React Native 0.86.3 and Node.js 20.20.2 are active. The
current audit passes reproducible install, format, lint, strict typecheck, 15
suites/76 tests, Expo dependency validation, Android Hermes export and the
critical audit threshold. Native iOS builds remain unavailable on this
Linux/WSL host.

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

Merge the Phase 2 hygiene PR after its corrected CI run passes, synchronize
`experimental`, then obtain the conflict-handling product decision before
Google/Apple provider upgrades. Do not begin Phase 3 automatically.

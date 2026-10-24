# Agent Status

## Current phase

Roadmap Phases 0, 1 and the Android-targeted Phase 2 account path are complete
in `experimental`. Phase 3 Favorites is implementation-complete on
`feature/phase-3-favorites-app`; cross-repository automated validation and the
physical Android flow are accepted. Publication/review remain before
integration. Apple authentication and native iOS validation remain deferred to
Phase 13.

## Current branch

`feature/phase-3-favorites-app`, branched from synchronized `experimental`.

## Current environment status

Expo SDK 57.0.31, React Native 0.86.3 and Node.js 20.20.2 are active. Format,
lint, strict typecheck, 23 suites/144 tests, Expo dependency validation and an
Android Hermes export pass. The direct Zod dependency is patched to 4.6.7; the
critical audit threshold passes while known Expo/Tailwind transitive
moderate/high advisories still require breaking upgrades. Native iOS validation
has not run on this Linux/WSL host.

## Completed milestones

- Phase 0 discovery, Phase 1 telemetry and Phase 2 guest/Google behavior remain
  green.
- Typed Favorites endpoints use the centralized authenticated API client for
  idempotent save/status/list/remove operations.
- The result card exposes one accessible heart action whose state comes from a
  cheap owner-scoped database query and whose mutation invalidates the list.
- The home header opens a dedicated Expo Router Favorites screen with live
  names, address, optional photo attribution, Maps action, saved date, removal,
  empty/error/loading and unavailable-place states.
- TanStack Query remains the sole owner of Favorites server state; Zustand and
  local databases do not mirror it.
- Confirming an existing-account switch explicitly merges guest Favorites into
  the Google owner through the API, then clears private Query state before the
  new principal is rendered.
- Successful saves emit the strict shared `restaurant_favorited` event.

## Active blocker(s)

No implementation or Android-validation blocker. The API and App feature
branches need publication/review before integration. Production infrastructure
and Apple/native iOS work remain Phase 12/13 gates.

## Important current decisions

- The API remains authoritative for Favorites and user ownership.
- The result heart does not load provider display content; it calls the cheap
  status endpoint. The full list is fetched only on the Favorites screen and
  uses a one-minute in-memory stale window to avoid unnecessary refetches.
- Provider presentation data is not persisted on-device. Google and photo
  author attribution remain attached to the live list response.
- Account switches/logout/recovery must clear private query state whenever the
  internal owner changes.
- Existing-account confirmation is labeled as a Favorites merge; cancelling
  preserves the guest unchanged and no other product data is implied.
- Apple authentication/native iOS remain Phase 13 release gates, not Phase 3
  blockers.

## Next intended action

Review the final diffs and publish both authorized Phase 3 feature branches for
CI and review before merge.

# Agent Status

## Current phase

Roadmap Phases 0--3 are complete in `experimental`; Phase 3 merged through API
PR #8 and App PR #12 after green CI and accepted physical Android validation.
Phase 4 Spin Activity Foundation is implementation-complete locally on its
feature branches. Its user-facing spin list was removed by product decision;
Phase 5 will expose only verified visits. Physical Android validation was
accepted on 2026-10-25; publication/review remain. Apple authentication and
native iOS validation remain deferred to Phase 13.

## Current branch

`feature/phase-4-spin-activity-app`, branched from synchronized `experimental`
after App PR #12 merged as `5881114`.

## Current environment status

Expo SDK 57.0.31, React Native 0.86.3 and Node.js 20.20.2 are active. Format,
lint, strict typecheck, 23 suites/145 tests, Expo dependency validation and an
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
- Confirming an existing-account switch explicitly merges guest Favorites and
  guest progress into the Google owner through the API, then clears private
  Query state before the new principal is rendered.
- Successful saves emit the strict shared `restaurant_favorited` event.
- Each recommendation sends its existing telemetry UUID as `spinId` so the API
  can associate minimal internal spin activity with its owner.
- Successful Maps launches update the owner-scoped Spin through the API while
  telemetry remains best-effort; this does not create a visit.
- The home header no longer exposes roulette history. Phase 5 will introduce
  `Mis visitas` using only verified check-ins.

## Active blocker(s)

No implementation or device blocker. Publication/review of both Phase 4
feature branches remain. Production infrastructure and Apple/native iOS work
remain Phase 12/13 gates.

## Important current decisions

- The API remains authoritative for Favorites and user ownership.
- The result heart does not load provider display content; it calls the cheap
  status endpoint. The full list is fetched only on the Favorites screen and
  uses a one-minute in-memory stale window to avoid unnecessary refetches.
- Provider presentation data is not persisted on-device. Google and photo
  author attribution remain attached to the live list response.
- Account switches/logout/recovery must clear private query state whenever the
  internal owner changes.
- Existing-account confirmation names Favorites and guest progress; cancelling
  preserves the guest unchanged and no later product data is implied.
- Roulette results and Maps openings are not visits. The future `Mis visitas`
  screen will show only the 10 newest verified check-ins.
- Apple authentication/native iOS remain Phase 13 release gates, not Phase 3
  blockers.

## Next intended action

Publish both accepted Phase 4 feature branches, verify CI and merge them into
`experimental`, then begin Phase 5 from the synchronized integration base.

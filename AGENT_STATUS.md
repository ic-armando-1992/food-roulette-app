# Agent Status

## Current phase

Roadmap Phases 0--4 are complete in `experimental`; Phase 4 merged through API
PR #9 and App PR #13 after green CI and accepted physical Android validation.
Phase 5 Verified Restaurant Check-In is implementation-complete locally on its
API/App feature branches. Automated API/App validation is green; physical
Android validation of Check-In and `Mis visitas` remains before publication.
Apple authentication and native iOS validation remain deferred to Phase 13.

## Current branch

`feature/phase-5-verified-checkins-app`, branched from synchronized
`experimental` after App PR #13 merged as `e333a44`.

## Current environment status

Expo SDK 57.0.31, React Native 0.86.3 and Node.js 20.20.2 are active. Format,
lint, strict typecheck, 27 suites/160 tests and an Android Hermes export pass.
The direct Zod dependency is patched to 4.6.7; the critical audit threshold
passes while known Expo/Tailwind transitive moderate/high advisories still
require breaking upgrades. Native iOS validation has not run on this Linux/WSL
host.

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
- The home header no longer exposes roulette history; its `Mis visitas` entry
  uses only verified check-ins.
- The result card now offers `HACER CHECK-IN`, obtains one fresh foreground
  high-accuracy location and renders pending, verified, too-far, poor-accuracy,
  permission and request-failure outcomes without retaining coordinates.
- The home header opens `Mis visitas`, which renders the 10 newest verified
  visits with live provider details, date, verification distance, Maps and
  empty/error/loading/unavailable states.
- Successful verification emits `restaurant_checked_in` and refreshes the Visit
  query. A new spin or reroll resets the prior Check-In result.
- A temporary API outage no longer leaves account-dependent screens loading
  forever. Account, Favorites and Visits expose an explicit guest-session retry,
  while the anonymous roulette remains usable.
- Every spin now requests a fresh foreground location and updates the visible
  locality. Rerolls preserve the cost-saving candidate pool only within 100
  meters; a meaningful move starts a pool for the new location. Check-In's fresh
  reading also synchronizes the shared visible location.

## Active blocker(s)

Physical Android validation of the Phase 5 Check-In and `Mis visitas` flow
remains before publishing its API/App branches. Production infrastructure and
Apple/native iOS work remain Phase 12/13 gates.

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
- Roulette results and Maps openings are not visits. `Mis visitas` shows only
  the 10 newest verified check-ins.
- Check-In requests location only after the explicit action, uses a 15-second
  acquisition timeout and does not persist or background-track coordinates.
- Apple authentication/native iOS remain Phase 13 release gates, not Phase 3
  blockers.

## Next intended action

Validate Check-In outcomes and the newest-10 `Mis visitas` screen on the
physical Android device. If accepted, publish both Phase 5 branches, verify CI
and merge them into `experimental`.

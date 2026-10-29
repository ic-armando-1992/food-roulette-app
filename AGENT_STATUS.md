# Agent Status

## Current phase

Roadmap Phases 0--6 are complete in `experimental`. Phase 6 Achievements
delivered the 50-item collection, XP/level progression and the final Android
grid/header/account presentation. API and App automated verification is green;
the remaining device matrix is tracked as release-readiness work, not a Phase 6
implementation blocker.

## Current branch

`docs/phase-6-final-closeout`, branched from synchronized `experimental` after
the Phase 6 App delivery was integrated as `8f4a449` and the API delivery as
`19e9f98`. No release tag was created.

## Current environment status

Expo SDK 57.0.31, React Native 0.86.3 and Node.js 20.20.2 are active. Format,
lint, strict typecheck and 30 suites/184 tests pass. Offline Metro/Hermes exports
pass for Android and iOS and include all 50 official images plus the locked
fallback. No device is currently visible through `adb`, so physical FPS/memory
measurements were not claimed.

## Completed milestones

- Added typed catalog, progress, summary, notification and acknowledgement API
  contracts without adding dependencies.
- Catalog and per-user progress use Expo SQLite persistence. Cached values render
  before background ETag revalidation and 304 responses reuse local data.
- All 50 assets and `locked_achievement` are registered centrally. Expo Image
  prefers versioned remote URLs with disk cache and falls back locally.
- Added a responsive two-column collection, level/XP/completion header,
  all/unlocked/pending/secret/category filters and an achievement detail modal.
- The original Stack/header navigation remains active: Logros, Visitas,
  Favoritos and the level-badged avatar appear in that order. Settings lives
  only inside the scrollable Account sheet, which closes before opening the
  existing application-settings destination.
- Refactored the collection to deterministic two-column card geometry without
  virtual-list container gaps, duplicate filter keys or viewport padding.
- The grid now owns each fixed-width/fixed-height cell; cards fill those cells
  and use fixed art, two-line title, rarity, progress and status slots. Content
  can truncate or clip inside its slot but cannot resize a card or column.
- The collection keeps explicit outer breathing room above and below the grid
  while preserving the existing horizontal inset and inter-card gaps.
- Card content redistributes the existing vertical inset to keep 18 pixels above
  the fixed-size achievement circle and a compact 2-pixel title offset without
  changing card/grid geometry or image dimensions.
- Memoized cards, images and the XP summary; stabilized item callbacks and keys;
  limited virtualized render batches; and disabled simultaneous grid image
  transitions.
- Expo Image now explicitly downsamples the 1254px source art at card size,
  uses memory/disk cache, keeps a local placeholder for remote assets and safely
  resets remote failures by URL.
- Achievement art now renders inside a fixed two-layer canvas. A centralized
  asset-key visual map applies bounded scale/translation overrides to measured
  alpha-bound outliers, with the same proportional treatment in cards, details
  and celebrations; no PNG or achievement definition changed.
- The compact header now has one XP bar plus a separate unlocked count. Pull to
  refresh performs real network revalidation, preserves cached data on errors
  and reports stale-data state.
- Locked-secret concealment is enforced at the UI boundary while public locked
  achievements retain their real name and image. The detail sheet scrolls on
  small screens and never reveals a locked secret condition.
- Locked secrets show generic copy, no target/progress and the locked fallback.
- Added a reduced-motion-aware reward popup with rarity treatment, XP, Continue
  and Ver mis logros actions.
- Server-confirmed spin/accept/visit responses display grouped activity-XP
  toasts; achievement XP remains explicit in the achievement celebration.
- The avatar has a level badge. Account and achievements screens share the
  server progression, XP bar and remaining-XP values.
- Level-up and achievement celebrations share one durable queue. Multi-level
  jumps render once with their complete from/to range.
- The durable owner-scoped queue deduplicates notifications, persists across
  restarts, presents one modal at a time and acknowledges each item to the API.
- The roulette supplies stable session UUIDs, explicit reroll state and an IANA
  time zone, and refreshes unlocks only after the result is visible. Maps and
  verified check-in consume their authoritative XP result immediately.
- Check-in sends the foreground observation timestamp; stale fixes are rejected
  without recording a visit.
- Logout/account switching clears private achievement data and generation checks
  prevent stale-account queue responses from being rendered.
- UI tests cover all asset registrations, locked progress, popup content/actions
  and the updated roulette contract; the existing full app suite remains green.

## Active blocker(s)

No active blocker remains for Phase 6. Bundled assets are the supported fallback
without CDN credentials. Complete Android/iOS accessibility, large-font,
reduced-motion and performance validation remains a Phase 13 release gate; no
Android device is currently connected to `adb`.

## Important current decisions

- TanStack Query owns live server state; SQLite is a last-known offline cache,
  not a second authoritative database.
- Queue persistence is namespaced by internal user ID and backend acknowledgement
  is the cross-device source of truth.
- No image was regenerated, modified or encoded into SQLite/AsyncStorage.
- The existing `FlatList` remains sufficient for the current 50 and tested 100
  items; no FlashList dependency or unreliable estimated item height was added.
- Original 1254x1254 art remains unchanged per product constraints; runtime
  downsampling and bounded virtualization address decode/render pressure.
- Visual-size overrides are based on alpha>=64 content bounds (roughly 1019 to
  1207 pixels across the source set), use a neutral default and remain limited
  to measured outliers instead of embedding per-card styling.
- The project remains mobile-only; the failed `--platform all` check was caused
  solely by the intentionally absent `react-native-web`. Android and iOS exports
  both pass independently.

## Next intended action

Merge this documentation closeout, then begin Phase 7 Sharing from synchronized
`experimental` when explicitly requested. Before a store release, execute the
deferred physical Android/iOS progression and accessibility matrix.

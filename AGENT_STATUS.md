# Agent Status

## Current phase

Roadmap Phase 0 — Existing Core/UI Completion is complete. The Spanish
roulette-first flow covers location acquisition, radius selection, initial
spin, request-bound loading, normalized failure states, restaurant reveal,
Maps and pool-aware reroll. Deterministic mobile tests now protect permission
grant/denial, unavailable and timed-out location, successful/slow/failed API
requests, retry and duplicate suppression, pool reuse, optional restaurant
metadata, closed hours, attribution, Maps and responsive roulette sizing.
When provider `mapsUri` is absent, the primary Maps action now falls back to a
universal Google Maps coordinate URL rather than disappearing.

Android inspection passes at the Pixel 10 Pro's physical 1280×2856 px at 480
dpi (approximately 427×952 dp) and a temporary small 960×1704 px viewport at
480 dpi (320×568 dp). The small viewport keeps all controls reachable through
the existing ScrollView and respects top/bottom system areas. Format, lint,
strict typecheck, 22 mobile tests, Expo dependency validation, Expo Doctor
21/21 and Android Hermes export pass as of 2026-10-08. Phase 1 has not started.

## Current branch

`test/phase-0-core-closeout`, based on the synchronized
`origin/experimental`. The earlier baseline and redesign checkpoints are
already published on `origin/experimental`; the Phase 0 closeout is committed,
published and tracking `origin/test/phase-0-core-closeout`. Its PR and
integration into `experimental` remain pending. Nothing has been merged to
`main`.

## Current environment status

Expo SDK 57.0.27, React Native 0.86.3, React 19, TypeScript 6, Expo Router, NativeWind
v4, TanStack Query, Zustand, Reanimated, Gesture Handler, Expo Location,
Image, SecureStore and SQLite, Lucide, React Hook Form and Zod are installed.
Node v20.20.2/npm 10.8.2 are available through NVM but are not loaded by the
default shell. Java 17 and Android SDK are present. The Linux `adb` wrapper
fails across WSL, while the Windows SDK `adb.exe` reaches the running emulator.
Native iOS builds are unavailable on this Linux/WSL host.
`.env.example` documents the device-reachable API URL. The ignored local mobile
`.env` and `.env.example` now match the backend's active
`http://10.0.2.2:3000` address through the Android host alias. The API health
endpoint is currently healthy on local port 3000. Expo Doctor
passes 21/21, the Android Hermes export succeeds, and a generated SDK 36 debug
APK compiled successfully before its managed-native tree was moved to `/tmp`.
The `android:emulator` script also advertises `10.0.2.2` to Expo Go, keeping its
bundle, Fast Refresh and LogBox channels on the same reachable host.
`npm audit --omit=dev` still reports transitive denial-of-service advisories in
the Expo/Metro/build graph whose suggested forced fixes downgrade or cross SDK
boundaries; no forced audit mutation was applied during this Phase 0 closeout.

## Completed milestones

- Functional Expo/configuration/assets baseline committed locally as
  `632d514` after removing only two Windows `Zone.Identifier` metadata files;
  `.gitignore` now excludes future Windows metadata plus build and coverage
  output.
- Mobile-specific `AGENTS.md` established with shared project/Git context.
- Persistent status and rolling-worklog strategy established.
- Repository, Git state and local mobile toolchain audited for the first mobile
  milestone.
- Minimal Expo Router + TypeScript mobile scaffold created and validated.
- Approved mobile dependencies and NativeWind v4/lint/format configuration
  installed; format, lint, typecheck and dependency validation pass.
- Query/Gesture/Safe Area providers, environment parsing, normalized API client
  errors and the exact backend random-recommendation contract are implemented.
- Discover screen, explicit location state machine, shared radius selection,
  duplicate-safe recommendation action, result/photo fallback and pool-aware
  reroll are implemented; format, lint and strict typecheck pass.
- All user-facing discovery copy, recommendation errors, accessibility labels,
  common provider category labels and native location permission copy are in
  Spanish.
- Location acquisition prefers a recent sufficiently accurate cached position,
  then uses a temporary high-accuracy foreground subscription for the first
  fresh update. It removes that subscription on success/error and times out
  after 12 seconds into the existing recoverable error/retry state.
- Shared buttons support visible busy state, tactile interaction feedback and
  accessible busy/disabled semantics; recommendation loading uses the dedicated
  roulette state for both initial searches and rerolls.
- Expo Doctor, Expo dependency validation, Android Hermes bundle export and a
  full 374-task Android debug APK build pass.
- Current coordinates are reverse-geocoded to an ISO country code before the
  location becomes ready; the code is sent with `allowInternational: false` so
  border-crossing radii remain domestic. Format, lint and typecheck pass.
- Initial searches and rerolls use a reusable animated roulette; rerolls enforce
  a full-screen roulette-focused state, rotate contextual search messages and
  respect reduced-motion accessibility. The animation follows actual request
  duration and Android Hermes export passes.
- Home, loading and result are explicit presentation states over the unchanged
  location/recommendation flow. The result reveal uses a large image, compact
  metadata/tags, address, Maps action, reroll and subdued Google attribution.
- Radius controls remain backed by the existing global `radiusMeters` state and
  are disabled during active searches; changing them resets pool exclusions but
  does not trigger a paid request by itself.
- Semantic colors are centralized in `src/theme/colors.json` and consumed by
  Tailwind, icons, native indicators and SVG. Discovery-specific radii, timing
  and roulette geometry are centralized separately; no component contains raw
  hexadecimal colors or duplicated feature constants.
- Recommendation images reset by URL and show an in-place loading state until
  the current restaurant's image has loaded, preventing stale-photo reuse while
  preserving card height and scroll position.
- The warm visual system, responsive roulette geometry, location pill, search
  messages and result reveal were verified on the Pixel 10 Pro emulator. Format,
  lint, strict typecheck, local Expo dependency validation and Android Hermes
  export pass.
- Provider-independent opening hours are displayed as a compact live status and
  expandable weekly schedule; missing hours leave the result layout unchanged.
- The final result hierarchy was visually verified with a real Tijuana result:
  photo, branded reveal, metadata, icon-backed categories, status, address,
  primary Maps action, secondary reroll and subdued attribution fit cleanly on
  the Pixel 10 Pro viewport.
- Jest Expo and React Native Testing Library provide focused, snapshot-free
  regression coverage: 6 suites and 22 tests pass for the Phase 0 discovery
  contract and edge states.
- The result preserves the required primary Maps action without provider
  `mapsUri` by opening a universal coordinate URL.
- Responsive Android verification passes at approximately 427×952 dp and at
  320×568 dp; the emulator was restored to its original physical resolution.
- Expo SDK patch dependencies are aligned; Expo dependency validation, Doctor
  21/21 and the Android Hermes export pass after the update.

## Active blocker(s)

Phase 0 implementation, validation and branch publication have no blocker. PR
creation is temporarily blocked because GitHub CLI is authenticated as
`vwaresol`, which is not a collaborator on this repository; the SSH identity
for `ic-armando-1992` is loaded and push access works. Native iOS and
physical-device validation still require the appropriate hardware/macOS host
and remain release-readiness work, not a Phase 0 blocker. Transitive dependency
advisories require a separately scoped security/dependency review rather than
`npm audit fix --force`.

## Important current decisions

- The baseline is split into one functional commit and one documentation/agent
  history commit so each checkpoint remains logically reviewable.
- The explicitly requested mobile vertical slice is now the active priority.
- The foundation targets current stable Expo SDK 57 and omits web scripts and
  web-only dependencies.
- Expo Router's internal peer graph requires `react-dom` pinned to the same
  React version; it is not used as an MVP web target.
- Recommendation calls have a 15-second timeout, no automatic retries/refetch,
  and expose only normalized error categories to feature UI.
- The initial call sends foreground coordinates, `radiusMeters`, the current ISO
  country code and a disabled international flag. Rerolls additionally send the
  opaque pool ID and prior restaurant exclusions.
- Mobile uses Expo/React Native/TypeScript and the documented state/UI stack.
- Mobile never calls Google Places or another places provider directly; all
  restaurant/provider traffic goes through `food-roulette-api`.
- First vertical slice is location → Surprise me → API recommendation → result
  → reroll, without auth, achievements, sharing, ads, profiles or collections.
- Phase 0 regression tests use Jest Expo plus React Native Testing Library and
  favor visible behavior assertions over snapshots or implementation details.

## Next intended action

Authenticate GitHub CLI as `ic-armando-1992`, then create and merge the
published Phase 0 closeout PR into `experimental`. Begin Phase 1 analytics and
observability only when explicitly requested, in a separate scoped change.

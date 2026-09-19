# Agent Status

## Current phase

The first mobile discovery vertical slice is implemented in Spanish. A
device-observed Android `getCurrentPositionAsync` stall is now handled through
a bounded foreground location subscription. Loading feedback for initial and
repeat recommendations is strengthened. The functional Expo baseline is now
captured locally in commit `632d514`; format, lint, strict typecheck and
whitespace checks pass. Device confirmation of the full flow remains pending.

## Current branch

`experimental`, tracking `origin/experimental`; the baseline commits are local
only and have not been pushed or merged.

## Current environment status

Expo SDK 57, React Native 0.86, React 19, TypeScript 6, Expo Router, NativeWind
v4, TanStack Query, Zustand, Reanimated, Gesture Handler, Expo Location,
Image, SecureStore and SQLite, Lucide, React Hook Form and Zod are installed.
Node v20.20.2/npm 10.8.2 are available through NVM but are not loaded by the
default shell. Java 17 and Android SDK are present; the WSL `adb` bridge fails.
Native iOS builds are unavailable on this Linux/WSL host.
`.env.example` documents the device-reachable API URL. The backend was
previously confirmed healthy on port 3002 and reachable from the Android
emulator at `10.0.2.2:3002`; the ignored local mobile `.env` now uses that
address. The API is not currently listening on local port 3002. Expo Doctor
passes 21/21, the Android Hermes export succeeds, and a generated SDK 36 debug
APK compiled successfully before its managed-native tree was moved to `/tmp`.

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
- Shared buttons support visible busy state, interaction feedback and accessible
  busy/disabled semantics; recommendation loading keeps the previous result
  while presenting a prominent progress layer during rerolls.
- Expo Doctor, Expo dependency validation, Android Hermes bundle export and a
  full 374-task Android debug APK build pass.

## Active blocker(s)

- No blocker remains for code, static, bundle or Android native-build checks.
- Manual location → live API → real result/photo → reroll verification is
  blocked because the API is currently stopped and Expo Go cannot download the
  Metro update through the current WSL/emulator connection. The WSL-to-Windows
  `adb` bridge also fails. Native iOS verification requires a macOS host.

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
- Only foreground coordinates and `radiusMeters` are sent for the initial call;
  rerolls additionally send the opaque pool ID and prior restaurant exclusions.
- Mobile uses Expo/React Native/TypeScript and the documented state/UI stack.
- Mobile never calls Google Places or another places provider directly; all
  restaurant/provider traffic goes through `food-roulette-api`.
- First vertical slice is location → Surprise me → API recommendation → result
  → reroll, without auth, achievements, sharing, ads, profiles or collections.

## Next intended action

Keep the baseline commits local until push is explicitly authorized. Then
reload and verify the improved recommendation loading states on the emulator
and complete location → recommendation → photo → reroll before declaring the
milestone fully complete.

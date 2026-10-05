# Agent Status

## Current phase

The first mobile discovery vertical slice is implemented in Spanish and has a
roulette-first consumer UI. It now presents three focused states: a home with a
large food roulette, compact live location and secondary distance selector; a
dedicated animated search experience; and a photo-led restaurant reveal.
Location acquisition reverse-geocodes coordinates to both a display label and
the required ISO country code, while recommendation requests explicitly disable
international results. Duplicate requests remain blocked and search animation
ends when the real API request resolves, without an artificial minimum delay.
The shared semantic palette now has one JSON source consumed by both NativeWind
and runtime UI props; discovery radii, timing and roulette geometry are isolated
in one feature constants module rather than individual components.
Recommendation photos are keyed by restaurant and resolved API URL and clear
the prior native image when a new restaurant arrives. A fixed-height loading
placeholder now remains visible until that specific photo finishes loading, so
an old restaurant photo cannot linger beside the new name and description.
The result also renders current opening status and the next open/close time when
available, with an accessible expandable weekly schedule and no placeholder for
restaurants whose provider data lacks hours.
The second visual refinement makes Maps the coral primary success action and
reroll the bordered secondary rejection action, maps only reliable provider
categories to food icons, gives live hours a restrained status treatment and
reduces unnecessary roulette depth/spacing.
The functional baseline remains captured locally in commit `632d514`; the
country-scoped roulette redesign and Expo emulator-host correction are captured
in local commit `9f5ae2f`. Format, lint, strict typecheck and Android Hermes
export pass. Device confirmation of the result hierarchy is complete.

## Current branch

`experimental`, tracking `origin/experimental`; the baseline and redesign
commits are local only. The branch is ready to push once the configured GitHub
SSH identity is loaded. Nothing has been merged.

## Current environment status

Expo SDK 57, React Native 0.86, React 19, TypeScript 6, Expo Router, NativeWind
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

## Active blocker(s)

- No blocker remains for code, static, bundle or Android native-build checks.
- Manual location/country → live API → domestic result/photo → reroll
  verification remains pending. Native iOS verification requires a macOS host.

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

## Next intended action

Load the `github-personal` SSH identity and push `experimental`. Continue manual
home → live search → Mexico-only result/photo/hours → reroll testing and tune
the motion or spacing only if the real interaction exposes a visual issue.

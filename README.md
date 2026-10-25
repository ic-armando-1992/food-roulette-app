# 🎰 Food Roulette Mobile

**Food Roulette** (codename) mobile application, built with **React Native via Expo** for **iOS and Android**.

## MVP Goal

Quickly answer:

> **Where should we eat?**

Main flow:

```text
Location
→ optional filters
→ SURPRISE ME
→ POST /v1/recommendations/random
→ real restaurant
→ reroll / Let's go!
```

The app **never calls Google Places directly**. Everything goes through `food-roulette-api`.

---

## 🧱 Technology Stack

### Core
- React Native
- Expo
- TypeScript
- Node.js LTS

### Navigation
- Expo Router
- Routes under `/app` must remain thin and render screens from `/src/features/**`.

### UI / Styling
- NativeWind v4
- Custom UI components
- Centralized semantic tokens for colors, spacing, radius, and typography
- Do not add React Native Paper, Tamagui, NativeBase, or another UI framework without a real need

### State
- TanStack Query: server state
- Zustand: global client/UI state
- `useState` / `useReducer`: local state
- React Hook Form + Zod: forms

### Persistence
- Expo SecureStore: tokens/credentials
- Expo SQLite: structured persistence only when it provides real value

### Mobile APIs
- Expo Location
- Expo Image
- React Native Reanimated
- React Native Gesture Handler
- Lucide React Native

---

## 📱 Platforms

MVP:
- iOS
- Android

Web is not part of the MVP.

### Android emulator from WSL

Google Sign-In is a native module, so use the emulator-specific development
build script rather than Expo Go:

```bash
npm run android:emulator -- --clear
```

The regular `npm run android` script is available for other LAN/device setups.
Both scripts prebuild/run the native app and then connect it to Metro; rerun the
native build after changing config plugins or native dependencies.

---

## 🧠 State Ownership

### Backend is the source of truth
Use TanStack Query for:
- recommendations
- restaurants
- visits
- favorites
- collection
- profile

### Global client/UI state
Use Zustand for:
- `radiusMeters`
- cuisine
- price levels
- onboarding/UI flags
- shared roulette state, if applicable

### Local state
Use `useState` / `useReducer`.

### Forms
Use React Hook Form + Zod.

### Sensitive data
Use SecureStore.

### Non-sensitive structured persistence
Consider SQLite.

Do not duplicate TanStack Query data inside Zustand.

---

## 🎨 Design System

Prefer semantic tokens:

```text
primary
primaryForeground
background
surface
surfaceSecondary
foreground
mutedForeground
border
success
warning
error
```

Final colors may change once the commercial name is defined.

`src/theme/colors.json` is the single color source for both NativeWind and
runtime props such as icons, SVG and native loading indicators. Feature-specific
values that are not global design tokens belong in their feature constants
module; discovery radii, timing and roulette geometry live in
`src/features/discovery/constants/discovery.constants.ts`.

User-visible and accessibility copy belongs in scoped `*.labels.ts` files;
components do not own prose. Component props and domain shapes belong in the
nearest `types/`, `contracts/` or model file, while reusable mappings, limits,
paths and other behavior constants belong in `*.constants.ts`. Keep these files
feature-local unless the definition is genuinely application-wide.

### Integrated notifications

Transient operation feedback uses the global notification API instead of
feature-local cards or native one-button alerts:

```ts
import { notify } from '@/core/notifications/notify';

notify.success('Asistencia registrada correctamente');
notify.error('No fue posible registrar la asistencia');
notify.warning('Ya registraste tu asistencia');
notify.info('Tu sesión expirará pronto');
```

`NotificationRegion` belongs immediately below the current screen header. It
renders one queued message at a time as part of normal layout, so its animated
entry pushes content instead of covering it. Messages expire according to their
variant or an explicit `durationMs`; use `persistent: true` only when the user
must acknowledge the message. Native alerts remain appropriate for decisions
that require two or more explicit actions, such as account-switch and logout
confirmation.

The implementation lives under `src/core/notifications/`. Feature code should
call `notify` and keep its visible copy in the feature's labels file. Do not add
another toast provider or render independent transient error banners.

Expected base components:

```text
src/components/ui/
├── Button.tsx
├── IconButton.tsx
├── Card.tsx
├── Chip.tsx
├── Badge.tsx
├── AppText.tsx
├── Input.tsx
├── Rating.tsx
├── EmptyState.tsx
└── LoadingState.tsx
```

Shared restaurant components:

```text
src/components/restaurant/
├── RestaurantCard.tsx
├── RestaurantHero.tsx
├── RestaurantPhoto.tsx
└── RestaurantMeta.tsx
```

Do not create a huge component library before it is needed.

---

## 🌐 Backend

The app consumes `food-roulette-api`.

Conceptual variable:

```env
EXPO_PUBLIC_API_BASE_URL=http://<host>:3000
EXPO_PUBLIC_TELEMETRY_ERROR_OUTBOX_TTL_DAYS=7
```

The outbox TTL must stay between 1 and 30 days and must not exceed the API's
configured `TELEMETRY_ERROR_RETENTION_DAYS`.

Do not hardcode DEV/PROD URLs.

Do not expose:
- `GOOGLE_PLACES_API_KEY`
- private Google references
- URLs containing credentials

---

## 🎯 First Vertical Slice

1. Open the app.
2. Request location.
3. Resolve the current ISO country code from those coordinates.
4. Show Discover.
5. Choose radius/basic filters.
6. Press **SURPRISE ME**.
7. Call `POST /v1/recommendations/random` with international results disabled.
8. Show name, photo, rating, category, price if available, and geographic distance.
9. Allow reroll.
10. Allow opening Maps.

The discovery presentation is split into three focused UI states without
changing the request contract: a roulette-first home, a dedicated animated
search state, and a photo-led restaurant reveal. Reverse geocoding also supplies
the compact city/region label shown on the home screen; only coordinates and the
ISO country code are sent to the recommendation API.

When a recommendation includes current opening hours, the result shows a compact
open/closed state and next opening/closing time. The user can expand the same
section to see the provider-supplied weekly schedule. Restaurants without hours
simply omit the section.

Do not block this milestone with:
- login
- profiles
- achievements
- XP
- friends
- ads
- sharing
- full collection

---

## 📍 Radius

A single source of truth:

```text
radiusMeters
```

Example:

```text
2 km selected
→ circle radius = 2000
→ API radiusMeters = 2000
```

The circle represents geographic radius, not driving distance.

The current app also sends the ISO country code resolved from the user's
coordinates. The backend keeps recommendations inside that country even when
the radius crosses a border. An international-results preference can be exposed
later through the existing API flag.

---

## 🗺️ Distances

- `straightLineDistanceMeters`: PostGIS / search
- `routeDistanceMeters`: future
- `routeDurationSeconds`: future

For the MVP, Google/Apple Maps can be opened without calculating routes internally.

---

## 🖼️ Photos

MVP:
- one primary photo
- fallback when unavailable
- photo errors do not break the recommendation

The image must be delivered through a secure backend contract.

---

## 🔐 Auth

Phase 2 preserves first use without login. At startup the app creates or
restores a stable guest owner through the API while rendering the roulette
immediately. A cryptographically random installation credential and rotating
refresh token are stored in Expo SecureStore; the short-lived access token
exists only in memory.

The shared API client attaches the bearer token centrally. A 401 for a request
that carried an access token triggers one coordinated refresh and one retry.
Network/bootstrap failures leave the existing roulette flow available and can
be retried without replacing the stored guest identity.

The API currently issues 15-minute access tokens and rotating refresh tokens
with a 30-day sliding inactivity window. A successful refresh preserves the
same internal user ID without invoking Google again. Logout revokes the current
Food Roulette session, clears its local credentials and starts a new guest; it
does not remove the Google account from the device or revoke other devices. If
the API is unreachable, local logout still completes and the UI states clearly
that remote revocation was not confirmed.

Current progression:

```text
secure guest bootstrap / restore
→ roulette
→ Google upgrade with explicit existing-account confirmation
→ favorites and later owned product data
→ Apple upgrade + native iOS validation (Phase 13 release readiness)
→ later sync/share/account ownership
→ Facebook optional later
```

The Android-targeted Phase 2 identity/authentication scope closed on
2026-10-23 after automated and physical-device validation. Product development
continues with Phase 5 verified Check-In after the spin-activity foundation
merged through API PR #9 and App PR #13. Apple authentication and native iOS
validation remain required before an iOS release and are intentionally deferred
to Phase 13.

## ❤️ Favorites

Phase 3 uses the authenticated API as the source of truth. The selected
restaurant card has one accessible heart action backed by the cheap
`GET /v1/favorites/:restaurantId` status route and idempotent `PUT`/`DELETE`
mutations. It does not load the full Favorites collection just to render one
heart.

The home header opens `/favorites`. That screen uses TanStack Query for the
server collection and renders loading, empty, error and unavailable-place
states plus live name/address, optional photo with author/source attribution,
Maps and removal actions. It applies a one-minute in-memory stale window to
avoid unnecessary provider-backed list refreshes. Favorites are not copied into
Zustand, AsyncStorage or SQLite.

The API stores only the user/restaurant association and resolves current
provider presentation when the list opens. The app therefore does not persist
Google display content and always renders the returned Google/photo attribution.
Logout, invalid-session recovery and confirmed switches to an existing account
clear private Query state so one owner's Favorites cannot remain visible for
another owner. If Google already belongs to another owner, the confirmation
dialog explicitly offers to combine the guest's Favorites and progress into
that account; the API performs the transfer transactionally before switching.

Phase 3 automated checks and its physical Android flow were accepted on
2026-10-24. API PR #8 and App PR #12 passed CI and merged into `experimental`.

## Spin activity and verified visits

Every recommendation and reroll carries the same generated `spinId` used by
telemetry. When a guest/account session is available, the API records that
successful result without storing the search coordinates or provider display
content. Anonymous fallback recommendations remain usable but cannot be
attached to an owner.

Spin activity remains internal for analytics and future product rules. The home
header does not expose a roulette-history screen. Opening Maps marks the Spin
idempotently after the native link succeeds, but it does not count as a visit.

Each spin obtains a fresh foreground position and updates the visible locality
before requesting a recommendation. A reroll reuses its cost-saving candidate
pool only when the new reading remains within 100 meters of the previous search;
after a meaningful move it starts a pool for the new location. A Check-In also
uses a fresh reading and synchronizes the displayed locality.

If Google already belongs to another owner, the explicit confirmation now
combines guest Favorites and progress before the private query cache is cleared
and the target account becomes visible.

The selected restaurant card offers `REGISTRAR VISITA`. This explicit action asks
for one fresh foreground high-accuracy location, applies a 15-second acquisition
timeout and submits the displayed Spin and restaurant to the API. Coordinates
remain in request memory and are not written to device storage or collected in
the background. The UI distinguishes verified, too-far, poor-accuracy,
permission and request-failure outcomes.

The home header opens `/visits` as `Mis visitas`. It displays only the 10 newest
verified Visits with current provider name/address, optional photo attribution,
Maps, checked-in date and verification distance, plus complete
loading/empty/error/unavailable states. A spin or Maps opening alone never
appears as a Visit, while returning to the same restaurant can create a later
separate Visit.

Successful verification emits `restaurant_checked_in` without exact location
properties and refreshes the server-backed Visit query. Confirming a switch to
an existing Google account transfers guest Visits together with Favorites and
internal spin progress.

The API remains authoritative for user identity and future owned data. The app
does not persist an authoritative balance, provider subject or provider profile.

Google Sign-In uses the native Credential Manager / Google Sign-In SDK and
therefore requires a development or release build; it does not run in Expo Go.
Configure these public OAuth identifiers in the local environment:

```text
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...apps.googleusercontent.com
```

The API must include the Web client ID in `GOOGLE_AUTH_CLIENT_IDS`. The iOS ID
also drives the config plugin's reversed URL scheme. Android OAuth setup must
use package `com.foodroulette.app` with the signing certificate SHA-1;
iOS uses bundle ID `com.foodroulette.app`. Do not commit Google service
files or provider tokens.

If Google already belongs to another internal user, the app keeps the guest
session active and displays a confirmation dialog. Cancel performs no account
operation. Confirm exchanges the server-issued one-time token for a new session
on the existing Google account and instructs the API to merge guest Favorites
and progress. The app never merges or rewrites owned data itself, and no later
data category is transferred implicitly.

### Android physical-device development build

Google Sign-In does not work in Expo Go. Use the existing local native build;
this repository does not currently have an EAS build profile. The development
build and API-backed roulette flow were validated on a physical SM-S948B on
2026-10-23.

Connect the phone through USB, enable USB debugging, accept the computer and
verify it is visible:

```bash
adb devices -l
```

Build/install the native development client initially and again after changing
config plugins or native dependencies:

```bash
cd /home/armando/projects/food-roulette/food-roulette-app
PATH=/home/armando/.nvm/versions/node/v20.20.2/bin:$PATH npm run android -- --device
```

Do not pass `--clear` to `expo run:android`; cache clearing belongs to
`expo start`.

#### USB-forwarded development

This is the simplest path while the phone remains connected. Configure the App
API URL as:

```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3000
```

Start the API in one WSL terminal:

```bash
cd /home/armando/projects/food-roulette/food-roulette-api
docker compose up -d postgres
PATH=/home/armando/.nvm/versions/node/v20.20.2/bin:$PATH npm run start:dev
```

Forward both services and start Metro in another terminal:

```bash
cd /home/armando/projects/food-roulette/food-roulette-app
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081
PATH=/home/armando/.nvm/versions/node/v20.20.2/bin:$PATH npm start -- --dev-client --localhost
```

Keep Metro running. If the installed development client retains an old server
URL and opens blank, reconnect it explicitly:

```bash
adb shell am start \
  -a android.intent.action.VIEW \
  -d 'exp+food-roulette://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081'
```

`http://127.0.0.1:3000/health` must respond from the phone. A blank browser page
at `http://127.0.0.1:8081/` is not an App test; Metro's diagnostic endpoint is
`http://127.0.0.1:8081/status` and should return `packager-status:running`.

#### LAN development

For a wireless/LAN setup, put the computer and phone on the same network and
configure the Windows LAN IPv4 address, never `localhost` or `10.0.2.2`:

```env
EXPO_PUBLIC_API_BASE_URL=http://<IP_LAN_DE_TU_PC>:3000
```

With WSL2 NAT, expose both WSL ports from an Administrator PowerShell and allow
them through the Windows firewall. Refresh these mappings after the WSL address
changes:

```powershell
$WslIp = ((wsl hostname -I).Trim() -split '\s+')[0]
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=3000
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=8081
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3000 connectaddress=$WslIp connectport=3000
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=8081 connectaddress=$WslIp connectport=8081
if (-not (Get-NetFirewallRule -DisplayName "Food Roulette API 3000" -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -DisplayName "Food Roulette API 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
}
if (-not (Get-NetFirewallRule -DisplayName "Food Roulette Metro 8081" -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -DisplayName "Food Roulette Metro 8081" -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow
}
```

Start Metro while advertising the Windows LAN address:

```bash
cd /home/armando/projects/food-roulette/food-roulette-app
REACT_NATIVE_PACKAGER_HOSTNAME=<IP_LAN_DE_TU_PC> \
  PATH=/home/armando/.nvm/versions/node/v20.20.2/bin:$PATH \
  npm start -- --dev-client --lan
```

Confirm from the phone that both
`http://<IP_LAN_DE_TU_PC>:3000/health` and
`http://<IP_LAN_DE_TU_PC>:8081/status` respond before opening the App.

The Android application ID is `com.foodroulette.app`. This repository's debug
APK is signed with SHA-1
`5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`; that exact
package/SHA-1 pair must exist in the Android OAuth client. The App reads the Web
client ID from `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`; the Android client remains a
Google Cloud package/signature registration and is not placed in `.env`. The
API must allowlist the same Web client ID in `GOOGLE_AUTH_CLIENT_IDS`.

---

## 🧪 Testing

Run the deterministic Phase 0 regression suite with:

```bash
npm test
```

The Jest Expo + React Native Testing Library suite covers location permission
and failure states, API success/failures/timeouts, loading/retry, duplicate-safe
spin and pool reroll, optional restaurant metadata, opening hours, attribution,
Maps and responsive roulette bounds. Tests use focused behavior assertions and
do not call Google or the Food Roulette API.

Prioritize:
- stores
- critical hooks
- discovery
- location states
- recommendation → result
- API errors

Mobile tests never call Google directly.

---

## 📊 Analytics and error reporting

The app records only behavior that exists in the current roulette flow:

- app opened and location granted/denied
- spin started, result, failure and explicit reroll
- restaurant opened in Maps

Product-event delivery to the API is best effort and never blocks location,
recommendations or navigation. A random session UUID exists only for the
current JavaScript process; persistent guest identity belongs to the later
authentication boundary and is not copied into client-supplied telemetry
properties. The payload does not include coordinates, city/region labels,
addresses or raw provider responses.

The root layout also installs a React error boundary and a global JavaScript
error handler. Sanitized fatal JavaScript reports are written synchronously to a
bounded SQLite outbox before the previous fatal handler runs and are retried on
the next launch; successful delivery removes them. Stored reports expire after
the configured TTL. A transient network error, timeout or HTTP 429 stops the
current flush so one outage cannot generate a retry burst; safe permanent 4xx
failures are discarded and flushing continues. This does not capture native
crashes, so the Phase 1 capability is JavaScript error reporting rather than a
complete native crash reporter. Decimal coordinate pairs, labeled
latitude/longitude, URL query strings, structured secrets and common credential
headers are redacted before local persistence and again at the network
boundary. The API performs the same sanitization before storage, and telemetry
failures remain invisible to the product flow.

---

## 🧭 Git

```text
main
experimental
feature/*
fix/*
hotfix/*
```

Normal flow:

```text
experimental
→ feature/<name>
→ PR experimental
→ PR main when release-ready
→ stable tag
```

---

## 🧠 Codex

Before working:
1. read `AGENTS.md`
2. read `AGENT_STATUS.md`
3. read the recent section of `AGENT_WORKLOG.md`
4. consult archived logs only when necessary

---

## 🚫 Do Not Add Prematurely

- Redux
- direct Google Places calls
- another UI framework
- social feed
- complex achievements
- ads
- ML
- complex maps/routes without a real need

## Principle

> If a dependency or abstraction does not help the current vertical slice or solve a real problem, postpone it.

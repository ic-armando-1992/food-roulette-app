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

Current progression:

```text
secure guest bootstrap / restore
→ roulette
→ Google upgrade with explicit existing-account confirmation
→ Apple upgrade (remaining Phase 2 increment)
→ later sync/share/account ownership
→ Facebook optional later
```

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
on the existing Google account; the app never merges user data itself.

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

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

Use the emulator-specific script so Expo advertises the Android host alias for
the JavaScript bundle, Fast Refresh and LogBox connection:

```bash
npm run android:emulator -- --clear
```

The terminal should show `exp://10.0.2.2:8081`. The regular `npm run android`
script remains available for other LAN/device setups.

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
```

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

Do not block first use.

Plan:

```text
guest
→ roulette
→ later sync/share/account
→ Google / Apple
→ Facebook optional later
```

Sensitive tokens → SecureStore.

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

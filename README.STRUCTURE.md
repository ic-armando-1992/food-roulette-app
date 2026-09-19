# Food Roulette Mobile — Project Structure

**Feature-first** architecture using Expo Router.

## Main Rules

- `/app` contains routes/layouts only.
- Routes are thin.
- Real UI/logic lives under `/src`.
- TanStack Query = server state.
- Zustand = client/UI state.
- NativeWind v4 = default styling system.
- SecureStore = secrets/tokens.
- SQLite only when there is a real need.
- The app never calls Google Places directly.
- MVP targets iOS/Android only.

---

## Suggested Structure

```text
food-roulette-app/
├── app/
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── collection.tsx
│   ├── restaurant/
│   │   └── [id].tsx
│   └── +not-found.tsx
│
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── endpoints/
│   │   └── contracts/
│   ├── components/
│   │   ├── ui/
│   │   └── restaurant/
│   ├── core/
│   │   ├── config/
│   │   └── providers/
│   ├── db/
│   ├── features/
│   │   ├── discovery/
│   │   ├── collection/
│   │   ├── auth/
│   │   └── profile/
│   ├── queries/
│   ├── stores/
│   ├── theme/
│   ├── lib/
│   └── types/
│
├── assets/
├── AGENTS.md
├── AGENT_STATUS.md
├── AGENT_WORKLOG.md
├── README.md
└── README.STRUCTURE.md
```

Do not create empty folders in advance.

---

## `/app`

Routing/layout only.

Example:

```tsx
import { DiscoverScreen } from "@/features/discovery/screens/DiscoverScreen";

export default function IndexRoute() {
  return <DiscoverScreen />;
}
```

Do not put here:
- raw fetch/API calls
- stores
- business rules
- validators
- complex location logic

---

## `/src/core`

Global infrastructure.

### `core/providers`
- QueryClientProvider
- Gesture root
- Safe area
- other genuinely global providers

### `core/config`
- `env.ts`
- validation of `EXPO_PUBLIC_*`

---

## `/src/api`

### `client.ts`
Responsible for:
- base URL
- headers
- parsing
- timeout/cancellation when applicable
- normalized errors

### `endpoints/`
Examples:
- `recommendations.api.ts`
- `restaurants.api.ts`
- `auth.api.ts`

### `contracts/`
Shared Food Roulette API types.

Never raw Google Places types.

---

## `/src/features/discovery`

First feature.

```text
discovery/
├── screens/
│   └── DiscoverScreen.tsx
├── components/
│   ├── Roulette.tsx
│   ├── DiscoveryFilters.tsx
│   ├── RadiusSelector.tsx
│   ├── RecommendationCard.tsx
│   └── RecommendationLoading.tsx
├── hooks/
│   ├── useCurrentLocation.ts
│   └── useRandomRecommendation.ts
├── store/
│   └── discovery.store.ts
├── models/
│   └── discovery.types.ts
└── utils/
```

Create only files that are actually used.

### Store
May store:

```text
radiusMeters
cuisine
priceLevels
```

Do not store recommendation results.

### `useRandomRecommendation`
Uses TanStack Query/mutation.

### `useCurrentLocation`
Models:
- idle
- requesting
- granted
- denied
- error

---

## `/src/features/collection`

Create when the feature exists.

Server data → TanStack Query.

Filters/UI → local/Zustand as needed.

---

## `/src/features/auth`

Do not block the first vertical slice.

When implemented:
- Google
- Apple
- Facebook optional
- SecureStore for tokens
- `/me` with TanStack Query

Do not use AsyncStorage for sensitive tokens.

---

## `/src/components/ui`

Small design system.

Use NativeWind v4 and semantic tokens.

Do not introduce Tamagui/Paper/NativeBase.

---

## `/src/components/restaurant`

Only components genuinely shared between features.

If a component is used only by discovery, keep it inside discovery.

---

## `/src/queries`

Only truly shared query keys/hooks.

Do not turn this into a global folder for absolutely every hook.

---

## `/src/stores`

Cross-feature Zustand stores.

Feature-specific stores must remain within their feature.

Do not create one giant `useAppStore`.

---

## `/src/db`

Expo SQLite.

Create when needed.

Possible structure:

```text
db/
├── client.ts
├── migrations/
├── repositories/
└── schema/
```

Do not automatically replicate the backend database.

---

## `/src/theme`

```text
theme/
├── colors.ts
├── spacing.ts
├── radius.ts
└── typography.ts
```

The brand can change without modifying dozens of screens.

---

## Path Aliases

Suggestion:

```text
@/*           -> src/*
@features/*   -> src/features/*
@components/* -> src/components/*
@api/*        -> src/api/*
@core/*       -> src/core/*
@theme/*      -> src/theme/*
```

Keep aliases limited.

---

## TanStack Query

If the backend is the source of truth:

> TanStack Query.

Examples:
- recommendation
- restaurant
- collection
- visits
- favorites
- profile

Do not copy that data into Zustand.

---

## Zustand

If it is shared client/UI state:

> Zustand.

Example:

```ts
type DiscoveryFilters = {
  radiusMeters: number;
  cuisine: string | null;
  priceLevels: number[];
};
```

---

## Radius Selector

```text
features/discovery/components/RadiusSelector.tsx
features/discovery/store/discovery.store.ts
```

One source:

```text
radiusMeters
```

Feeds both the map/circle and the API request.

---

## Location

```text
features/discovery/hooks/useCurrentLocation.ts
```

Do not mix permissions directly with Roulette.

---

## Recommendation

Conceptually:

```text
location + filters
→ POST /v1/recommendations/random
→ TanStack Query mutation
→ RecommendationCard
```

Reroll is always an explicit action.

---

## Discovery States

- location pending
- denied
- ready
- loading recommendation
- success
- no candidates
- network error
- backend error

---

## Initial Screens

Start with Discover only.

The result can be:
- state within Discover, or
- separate screen

Decide based on actual UX.

Do not create empty tabs for future features.

---

## Forms

Use React Hook Form + Zod only when there is an actual form.

Do not use RHF for simple chips/sliders.

---

## SecureStore

For:
- auth/session tokens
- sensitive credentials

Not for large objects.

---

## SQLite

Possible uses:
- user-owned offline records
- recent suggestion IDs
- structured persistence

Only when needed.

---

## NativeWind

Default styling system.

`StyleSheet` may exist in specific cases, for example native APIs or animations, but do not mix multiple systems without a reason.

---

## Reanimated

Uses:
- roulette
- recommendation reveal
- badge/visit confirmation

Do not animate everything.

---

## How to Add a Feature

1. Create `src/features/<feature>/`.
2. Add only necessary subfolders.
3. Define state ownership.
4. Add API/hook if applicable.
5. Create screen.
6. Create a thin route under `/app`.
7. Run lint/typecheck/tests.

---

## How to Add a Screen

1. Identify feature.
2. Create it under `src/features/<feature>/screens/`.
3. Create route under `/app`.
4. Route only imports/renders screen.
5. Extract reusable logic into hooks/components.

---

## Agent Context

- `AGENTS.md`: permanent rules.
- `AGENT_STATUS.md`: short current state.
- `AGENT_WORKLOG.md`: recent activity.
- `docs/agent-logs/`: history.

## Final Principle

> The structure grows with the product. Do not create empty architecture before it is needed.

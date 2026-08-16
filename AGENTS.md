# Food Roulette — Project Context

> Persistent instructions for AI coding agents working in this repository.

## Product

Food Roulette is the temporary codename. Do not hard-code the commercial brand into domain entities because the final product name will be chosen later.

The MVP solves one primary problem:

**Given the user's location and optional filters, quickly choose a nearby place to eat at random.**

The first product vertical slice is:

1. Open the mobile app.
2. Obtain location permission / coordinates.
3. User taps or spins "Surprise me".
4. Mobile sends location + filters to the backend.
5. Backend returns one eligible restaurant.
6. Mobile shows the result.
7. User can reroll.

After the core works, the MVP expands to visits, personal ratings, favorites, collection/history, authentication and sharing.

## Product principles

- Optimize first for a fast, fun recommendation loop.
- Do not overbuild features before the core roulette flow works end-to-end.
- Prefer simple, maintainable architecture over speculative scale.
- Design so the system can grow without requiring a rewrite.
- Cost control matters, especially external Places API calls.
- Keep provider-owned data separate from app-owned/user-owned data.
- Do not assume Google/Foursquare/Yelp fields may be stored indefinitely; respect provider terms.
- Avoid coupling the product domain to a single Places provider.
- The final public product name is undecided. `Food Roulette` is a codename.

## Repository strategy

There are two private repositories:

- `food-roulette-api`
- `food-roulette-app`

Versions are independent.

## Git workflow

Branches:

- `main`: stable/releaseable code.
- `experimental`: primary integration/development branch.
- `feature/*`: new work; branch from `experimental`.
- `fix/*`: development bug fixes; branch from `experimental`.
- `hotfix/*`: urgent production fixes; branch from `main`, then merge/backport into `experimental`.

Normal flow:

`experimental -> feature/<name> -> PR experimental -> PR main when release-ready -> stable version tag`

Rules:

- Do not implement normal features directly on `main`.
- Check the current branch before making substantial changes.
- Prefer small, logically scoped commits.
- Do not create or push release tags unless explicitly requested.
- Do not push/merge branches unless explicitly requested.
- Use Semantic Versioning independently in each repository.
- Before 1.0, examples include `v0.1.0-beta.1`, `v0.1.0-rc.1`, `v0.1.0`.
- Future intent: `experimental` may deploy to DEV; stable tags from `main` identify/trigger PROD releases.

## Security

Never commit:

- `.env`
- API keys
- OAuth secrets
- Google/Apple credentials
- service-account credentials
- production database credentials
- generated secret files

Provide `.env.example` files containing variable names and safe placeholders only.

## Agent working style

Before substantial implementation:

1. Read this entire `AGENTS.md`.
2. Inspect existing code/configuration before proposing replacements.
3. Check the current Git branch.
4. State important assumptions when repository state differs from these instructions.
5. Prefer incremental changes.
6. Run relevant lint/typecheck/tests after changes.
7. Do not silently introduce a new framework, cloud service, database, state library or architectural pattern.
8. Do not perform destructive system/database operations without explicit approval.
9. Keep documentation updated when an architectural decision or developer workflow changes.
10. If instructions conflict, ask before making an irreversible change.

Do not overengineer for one million users today. Build the MVP correctly, with clean boundaries that allow measured scaling later.


---

# Mobile App Repository Instructions

## Primary stack

Use:

- TypeScript
- React Native
- Expo
- Expo Router
- NativeWind v4
- TanStack Query
- Zustand
- React Hook Form
- Zod
- React Native Reanimated
- React Native Gesture Handler
- Expo Location
- Expo SecureStore
- Expo SQLite
- Expo Image
- Lucide icons

Do not introduce React Native Paper, Tamagui, Redux or another competing UI/state framework unless explicitly requested.

## State ownership

Use each tool for a specific purpose:

### TanStack Query
Server state only:
- recommendations
- restaurant details returned by the API
- profile/server data
- visits/favorites/collections when server-backed

Do not duplicate TanStack Query server collections into Zustand.

### Zustand
Small global client/UI state:
- active roulette filters
- transient app preferences
- onboarding/UI flags where global access is justified

Do not turn Zustand into a second database.

### React component state
Use `useState` or local reducer state for truly local/transient component state.

### React Hook Form + Zod
Use for forms and form validation.

### SecureStore
Use for sensitive local tokens/credentials.

### SQLite
Use only for structured local persistence/offline data where it provides real value. Do not mirror the entire backend database locally without a defined offline requirement.

## UI and styling

Use NativeWind v4 plus a small project design system.

Prefer reusable primitives/components such as:

- Button
- Card
- Chip
- Badge
- Rating
- RestaurantCard
- EmptyState
- LoadingState

Centralize design tokens/semantic styles instead of scattering arbitrary styling values.

Do not prematurely build a huge component library.

The UI should feel playful, fast and focused on the "surprise me" interaction.

## Navigation

Use Expo Router.

Keep routes/screens focused and avoid putting business/network logic directly into route components.

Organize domain UI/features coherently rather than creating one giant `components` directory.

## Backend boundary

The app talks to the Food Roulette NestJS API.

Do not call Google Places directly from the mobile application.

Do not embed Google Places server credentials in the app.

The mobile application should consume provider-independent backend DTOs.

API base URL must be environment-configurable for:

- local development
- future DEV
- future PROD

## Location

Use Expo Location.

Treat location permission as an explicit UX state:

- not requested
- granted
- denied
- unavailable/error

Do not repeatedly prompt users after denial.

The first vertical slice only needs enough location functionality to send coordinates to the recommendation API.

## Authentication

Authentication comes after the core roulette vertical slice unless the current milestone explicitly changes that.

Planned identity providers include:

- Google
- Apple
- Facebook

The architecture should allow anonymous/guest usage first if supported by the backend design, then account linking/merge later.

Never store auth tokens in AsyncStorage when SecureStore is appropriate.

## First product vertical slice

Prioritize:

```text
Open app
  |
request/get location
  |
optional minimal filters
  |
tap/spin "Surprise me"
  |
POST /v1/recommendations/random
  |
loading/searching experience
  |
restaurant result
  |
reroll
```

Do not block this vertical slice on:

- profile
- achievements
- social graph
- complex sharing
- full collection system
- ads
- polished authentication

Those follow after the core loop is validated.

## Network behavior

Use TanStack Query for backend interactions where appropriate.

Prevent accidental duplicate recommendation requests caused by renders/refetch defaults.

A user-triggered reroll should be an intentional action.

Handle:

- loading
- timeout/network error
- no eligible restaurant
- location denied
- backend unavailable

Do not expose raw backend/provider errors directly to users.

## Local persistence

The MVP may begin with local persistence for selected UX state.

However, features that require cross-device identity, public profiles, shared collections or account recovery belong on the backend.

Do not design a local-only model that makes later account synchronization unnecessarily difficult.

## Performance

- Keep startup lightweight.
- Avoid loading large restaurant datasets onto the phone.
- Use Expo Image for remote images.
- Avoid unnecessary global rerenders.
- Optimize only after profiling except for obvious architectural problems.

## Release readiness

The mobile repository uses the shared Git workflow in this file.

App versioning is independent from API versioning.

Do not configure App Store/Play Store production release credentials until explicitly requested.

Do not add AdMob until the core experience is working and the monetization milestone begins.

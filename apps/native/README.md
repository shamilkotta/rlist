# rlist native (Expo)

Mobile client for rlist: Expo SDK 55, Expo Router, React 19, and a local SQLite database via Drizzle for offline-friendly article storage, synced with the shared Convex backend.

## Layout

- `app/` — Expo Router routes: `_layout.tsx`, `index`, `(auth)/` (login, signup, etc.), `(app)/` (home, search, profile, save URL).
- `features/` — Feature modules (e.g. `home/`, `auth/`) with colocated components.
- `db/` — SQLite client, schema, and repositories.
- `drizzle/` — SQL migrations; `drizzle.config.ts` configures Drizzle Kit.
- `hooks/` — Shared hooks (sync, search, share intent, theme, etc.).
- `lib/` — Auth client, Convex client, env, URLs, tags, dates.
- `components/`, `constants/`, `assets/` — Shared UI, theme, and images/fonts.

## Environment

The app reads public env at build time (Expo `EXPO_PUBLIC_*`). Set at least:

- `EXPO_PUBLIC_CONVEX_URL`
- `EXPO_PUBLIC_CONVEX_SITE_URL`
- `EXPO_PUBLIC_SITE_URL` — Your site origin (used for auth/links).

Use `.env` or your Expo/EAS config as you normally would for this project.

## Commands

From the monorepo root:

```bash
pnpm --filter native start
pnpm --filter native ios
pnpm --filter native android
pnpm --filter native web
pnpm --filter native lint
```

Database (Drizzle):

```bash
pnpm --filter native db:generate
pnpm --filter native db:push
```

Or from `apps/native`:

```bash
pnpm start
pnpm ios
pnpm android
```

The default root `pnpm dev` does not start the Expo app; start Convex separately (e.g. `pnpm --filter @rlist/api dev` or full stack with root scripts that include the API) and then run the native app.

## Dependencies of note

- `@rlist/api` — Workspace Convex client types.
- `better-auth`, `@better-auth/expo` — Mobile auth.
- `expo-router`, `expo-sqlite`, `drizzle-orm` — Navigation and local data.

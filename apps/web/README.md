# rlist-web

Web client for rlist: TanStack Start (Vite) with file-based routes, Convex for data, and Better Auth. Deployed with Cloudflare (Wrangler).

## Layout

- `src/routes/` — File-based routes (`__root.tsx`, `index.tsx`, auth screens, etc.); `routeTree.gen.ts` is generated.
- `src/components/` — UI (including shared primitives under `components/ui/`).
- `src/hooks/` — React hooks.
- `src/lib/` — Auth helpers, article/url utilities, and server/client wiring.
- `public/` — Static assets.
- Vite, TanStack, and environment typing live at the app root (`vite.config.ts`, `app.config.ts`, `src/env.d.ts`).

## Environment

Create `apps/web/.env.local` (or the env files Vite loads for your mode) with at least:

- `VITE_CONVEX_URL` — Convex HTTP URL for the deployment used by this app.
- `VITE_CONVEX_SITE_URL` — Convex site URL (Better Auth / OAuth callbacks).

## Commands

From the monorepo root (recommended):

```bash
pnpm --filter rlist-web dev          # Vite dev server on port 3000
pnpm --filter rlist-web build
pnpm --filter rlist-web test         # Vitest
pnpm --filter rlist-web typecheck
pnpm --filter rlist-web lint
```

Or from `apps/web`:

```bash
pnpm dev
pnpm build
pnpm preview         # build + wrangler dev
pnpm deploy          # build + wrangler deploy
```

Run `pnpm dev` from the repo root to start both `@rlist/api` (Convex) and this app when developing the full stack.

## Dependencies of note

- `@rlist/api` — Workspace Convex types and API surface.
- `convex`, `@convex-dev/better-auth` — Client and auth integration.

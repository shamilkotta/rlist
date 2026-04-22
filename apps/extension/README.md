# rlist-extension

Chromium extension for rlist: Vite, React, Tailwind, and the same Convex + Better Auth stack as the web app. Build output can be loaded unpacked from `dist/` or packaged as `rlist.zip` at the extension root.

## Layout

- `src/popup/` — Extension popup entry (`index.html`, `main.tsx`, `App.tsx`, components).
- `src/background/` — Service worker / background script.
- `src/content/` — Content scripts injected into web pages.
- `src/lib/` — Convex client, auth, storage, env, URL helpers, utilities.
- `src/components/ui/` — Small UI primitives used in the popup.
- `src/assets/`, `src/styles/` — Icons, logo, global CSS.
- Vite + CRX config at the app root (`vite.config.ts`, `manifest`).

## Environment

Set Vite env for your Convex deployment (e.g. `apps/extension/.env.local` or `.env.production`):

- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`
- `VITE_SITE_URL` — Site origin (auth and links).

## Commands

From the monorepo root:

```bash
pnpm dev:extension            # same as: pnpm --filter rlist-extension dev
pnpm build:extension          # build + create rlist.zip
pnpm --filter rlist-extension typecheck
pnpm --filter rlist-extension lint
```

Or from `apps/extension`:

```bash
pnpm dev        # Vite watch build (outputs to dist/)
pnpm build      # production build and zip
```

**Note:** Root `pnpm dev` intentionally excludes this package so the default dev loop is API + web only. Use `pnpm dev:extension` when working on the extension.

## Loading in the browser

After `pnpm dev` or `pnpm build`, open Chrome/Edge, go to `chrome://extensions`, enable Developer mode, and load `apps/extension/dist` as an unpacked extension.

## Dependencies of note

- `@rlist/api` — Workspace Convex types.
- `@crxjs/vite-plugin` — CRX build integration.

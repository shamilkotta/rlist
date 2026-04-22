# @rlist/api (Convex)

Shared backend for rlist. This package is the Convex project: one deployment serves the web app, native app, and browser extension. Client apps depend on it via the workspace name `@rlist/api`.

## Layout

- `convex/` — All server code for Convex.
  - `schema.ts` — Table definitions and indexes.
  - `auth.ts`, `auth.config.ts` — Better Auth and identity wiring.
  - `articles.ts` — Article-related queries and mutations.
  - `http.ts` — HTTP routes (e.g. auth callbacks, webhooks).
  - `lib/` — Server helpers (e.g. email).
  - `_generated/` — **Generated** by `convex dev` / `convex codegen` (do not edit by hand).
- `package.json` — Scripts; Convex CLI runs with this package as the project root.

## Commands

From the monorepo root:

```bash
pnpm --filter @rlist/api dev         # convex dev: sync functions, run codegen, watch
pnpm --filter @rlist/api deploy      # convex deploy
pnpm --filter @rlist/api codegen     # one-off codegen
pnpm --filter @rlist/api typecheck
```

Or from `packages/api`:

```bash
pnpm dev
pnpm deploy
pnpm codegen
```

First-time setup: `convex dev` will prompt for login and project linking. After that, copy the deployment URL into each client’s env files (`VITE_*`, `EXPO_PUBLIC_*`).

## Documentation

- Project-specific Convex tips: [convex/README.md](./convex/README.md)
- Convex product docs: [https://docs.convex.dev](https://docs.convex.dev)

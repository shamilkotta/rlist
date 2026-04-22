# rlist

rlist is a read-later style product for saving and searching articles across a web app, a mobile app, and a browser extension, backed by a single Convex API. The repo is a pnpm and Turborepo monorepo: shared backend code lives in `packages/api`, and each client in `apps/` connects to the same Convex deployment.

## Project structure

```
rlist/
├── apps/
│   ├── web/            # rlist-web — TanStack Start web app (Vite)
│   ├── native/         # Expo (React Native) mobile app
│   └── extension/      # rlist-extension — Chrome extension (Vite)
├── packages/
│   └── api/            # @rlist/api — Convex backend (shared by all clients)
├── turbo.json
├── biome.json
├── pnpm-workspace.yaml
└── package.json
```

## Apps and packages

| Name | Path | Role |
|------|------|------|
| **Web** | `apps/web` | Main web client; TanStack Router/Start, deployable with Wrangler. |
| **Native** | `apps/native` | iOS/Android with Expo Router; local SQLite (Drizzle) plus Convex sync. |
| **Extension** | `apps/extension` | Browser extension (popup, background, content scripts). |
| **API** | `packages/api` | Convex project: schema, queries, mutations, HTTP routes, auth. |

See each package’s README for folder layout, environment variables, and commands.

## Prerequisites

- Node.js 20+
- pnpm 9+ (see `packageManager` in `package.json`)

## Install

```bash
pnpm install
```

## Development

The API must be running (or have a deployed URL) so clients can point `VITE_CONVEX_URL` / `EXPO_PUBLIC_CONVEX_URL` at it.

From the repository root, this starts the Convex dev server and the web app (the extension is excluded from this default; see `apps/extension`):

```bash
pnpm dev
```

- Web: http://localhost:3000
- Convex CLI prints a deployment URL; use it in each app’s env files as documented in those READMEs.

Other useful root scripts:

| Command | Description |
|---------|-------------|
| `pnpm dev:extension` | Watch-build the browser extension. |
| `pnpm build` | Build all packages via Turbo. |
| `pnpm build:web` | Build only `rlist-web`. |
| `pnpm build:extension` | Build the extension (and `rlist.zip` bundle). |
| `pnpm deploy:web` | Build and deploy the web app (Wrangler). |
| `pnpm preview:web` | Production build then Wrangler dev preview. |
| `pnpm lint` | Lint across the repo. |
| `pnpm check` / `pnpm format` | Biome check or format. |
| `pnpm typecheck` | Typecheck all packages that define the task. |

## Tech stack (overview)

- **Web**: TanStack Start, React, Vite, Tailwind, Cloudflare (Wrangler).
- **API**: [Convex](https://convex.dev) (`packages/api`), Better Auth integration.
- **Monorepo**: pnpm workspaces, Turborepo, Biome.
- **Native**: Expo, Expo Router, Drizzle + SQLite.
- **Extension**: Vite, CRX plugin.

## License

MIT

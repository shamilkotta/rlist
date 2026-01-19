# rlist

A modern monorepo with TanStack Start frontend and Convex backend.

## Tech Stack

- **Frontend**: [TanStack Start](https://tanstack.com/start/latest) (React)
- **Backend**: [Convex](https://convex.dev)
- **Package Manager**: pnpm
- **Monorepo Tool**: Turborepo
- **Linting/Formatting**: Biome
- **Git Hooks**: Husky + lint-staged

## Project Structure

```
rlist/
├── apps/
│   ├── web/              # TanStack Start web app
│   └── native/           # Future React Native app
├── packages/
│   ├── ui/               # Shared UI components
│   └── utils/            # Shared utilities
├── convex/               # Convex backend functions
├── turbo.json            # Turborepo config
├── biome.json            # Biome linting/formatting
└── pnpm-workspace.yaml   # Workspace definition
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

1. **Start Convex backend** (requires Convex account):

```bash
# First time setup - this will prompt you to log in and create a project
pnpm dev:convex
```

This will output a Convex URL. Copy it.

2. **Configure environment**:

Create `apps/web/.env.local`:

```env
VITE_CONVEX_URL=<your-convex-url>
```

3. **Start the web app**:

```bash
pnpm dev
```

The app will be available at http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm dev:convex` | Start Convex dev server |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format all files |
| `pnpm check` | Run Biome checks |
| `pnpm typecheck` | Type check all packages |

## Shared Packages

### @repo/ui

Shared React UI components. Import like:

```tsx
import { Button } from '@repo/ui';
```

### @repo/utils

Shared utilities and constants. Import like:

```tsx
import { cn, APP_NAME } from '@repo/utils';
```

## Adding React Native (Future)

When ready to add React Native:

1. Create an Expo app in `apps/native`
2. Configure Metro to resolve workspace packages
3. If Metro has issues, add `.npmrc` with `shamefully-hoist=true`

## Notes

- **Generated Files**: TanStack Router generates `routeTree.gen.ts` and Convex generates `_generated/` on first dev run. TypeScript errors are expected before running dev servers.
- **Convex Account**: You'll need a Convex account to run the backend
- **TanStack Start RC**: Currently in Release Candidate, APIs are stable but pin versions

## License

MIT

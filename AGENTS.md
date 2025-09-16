# Repository Guidelines

## Project Structure & Module Organization
This monorepo uses npm workspaces. Application code lives under `packages/*` and `services/*`, each with its own `package.json`. `packages/ui` hosts the Preact component library; place source in `src`, builds in `lib`, and stories in files named `*.stories.tsx`. `services/web` is the Astro site that relies on the UI components and crawler data; store app files in `src`, tests in `tests`, and static assets in `public`. `services/crawler` provides the data ingestion pipeline; keep runtime logic in `src`, tests in `tests`, and let the build output `lib`. Shared config files (`biome.json`, `tsconfig.json`, `cspell.json`) sit at the repository root.

## Build, Test, and Development Commands
Run `npm ci` at the root to install all workspaces. Build everything with `npm run build`. Execute the full test matrix via `npm test`. Target a single workspace with `npm run <script> -w <workspace>`: examples include `npm run storybook -w @vgmo/ui`, `npm run dev -w @vgmo/web`, and `npm run build -w @vgmo/crawler`. Check crawler coverage using `npm run coverage -w @vgmo/crawler`.

## Coding Style & Naming Conventions
Write TypeScript (`.ts`/`.tsx`) and JSX via Preact (`jsx: react-jsx`, `jsxImportSource: preact`). Use spaces for indentation and PascalCase for component directories (e.g. `src/Button/Button.tsx`). Organize modules with `ComponentName/index.tsx` entry points. Apply Biome for formatting and linting (`npx biome ci .`) and respect automatic import organization.

## Testing Guidelines
Storybook Test Runner powers UI tests; run `npm test -w @vgmo/ui` for assertions and nyc coverage. The web and crawler services rely on the Node test runner with `--experimental-strip-types`; use `npm test -w @vgmo/web` or `npm test -w @vgmo/crawler`. Name tests `*.test.ts` and store them in `tests/`. Regenerate crawler output before building the web site so `services/web/public/data/concerts.json` stays current.

## Commit & Pull Request Guidelines
Follow Conventional Commits (e.g. `feat(ui):`, `fix(crawler):`, `chore(root):`) and include tests when behavior changes. Pull requests should summarize the change, link issues, and attach UI screenshots or Storybook URLs when relevant. Before review, ensure `npm run build --workspaces`, `npm test --workspaces`, and `npx biome ci .` succeed on a clean working tree.

## Security & Tooling Tips
Install pre-commit hooks via `pre-commit install` to run Biome, cspell, hadolint, and secretlint automatically. Never commit secrets. Prefer existing dependencies and the Node standard library; scope new ones to the workspace that needs them. Stick to the current Node LTS release and run commands from the repository root to avoid workspace resolution issues.

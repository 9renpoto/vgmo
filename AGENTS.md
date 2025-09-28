# Repository Guidelines

## Project Structure & Module Organization
The monorepo is managed with npm workspaces. UI components live in `packages/ui` (source in `src`, builds emitted to `lib`, stories as `*.stories.tsx`). Shared types reside in `packages/types`. The Astro site is under `services/web` with app code in `src`, tests in `tests`, and static assets in `public`. The data crawler sits in `services/crawler`, keeping runtime logic in `src`, tests in `tests`, and compiled artifacts in `lib`. Shared configuration such as `biome.json`, `tsconfig.json`, and `cspell.json` stays at the repository root.

## Build, Test, and Development Commands
Install dependencies once with `npm ci`. Build every workspace via the native TypeScript compiler by running `npm run build`, or target a package with `npm run build -w <workspace>` (e.g., `@vgmo/ui`). Launch the Astro dev server using `npm run dev -w @vgmo/web`, open Storybook with `npm run storybook -w @vgmo/ui`, and execute the crawler directly through `npm run crawl` (delegates to `node --experimental-strip-types src/main.ts`). Run the full test matrix using `npm test` or focus on a workspace with `npm test -w <workspace>`.

## Coding Style & Naming Conventions
Code is written in TypeScript and Preact. Use spaces for indentation, PascalCase for component directories (e.g., `src/Button/Button.tsx`), and provide `ComponentName/index.tsx` entry points. Formatting and linting are handled by Biome (`npx biome ci .`); allow it to manage import order. Stick to Node 20.6+ so `tsgo` is available.

## Testing Guidelines
The UI workspace relies on Storybook Test Runner (`npm test -w @vgmo/ui`) with coverage reporting. The web and crawler services use the Node test runner with `--experimental-strip-types`; invoke `npm test -w @vgmo/web` or `npm test -w @vgmo/crawler`. Name test files `*.test.ts` and place them under each workspace’s `tests/` directory. Regenerate crawler output via `npm run crawl` before building the web site to keep `services/web/public/data/concerts.json` current.

## Commit & Pull Request Guidelines
Follow Conventional Commits such as `feat(ui): add carousel` or `fix(crawler): handle empty feed`. Each pull request should summarize the change set, link relevant issues, and include Storybook URLs or screenshots when the UI shifts. Before requesting review, ensure `npm run build --workspaces`, `npm test --workspaces`, and `npx biome ci .` all succeed on a clean tree.

## Security & Tooling Tips
Install the provided pre-commit hooks with `pre-commit install` to run Biome, cspell, hadolint, and secretlint automatically. Scope new dependencies to the workspace that needs them and avoid committing secrets. Prefer the existing `tsgo` toolchain and Node standard library utilities when extending functionality.

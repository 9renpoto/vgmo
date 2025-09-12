# Repository Guidelines

## Monorepo & npm Workspaces
- This repository is a monorepo managed with npm workspaces.
- Workspaces: `packages/*`, `services/*` (each package has its own `package.json`).
- Install all: `npm ci` (run at the repo root).
- Run in a specific workspace: use `-w <name>`, e.g. `npm run -w @vgmo/ui build`.
- Run across all workspaces: `npm run build --workspaces` / `npm test --workspaces`.
- Add a dependency to a specific workspace: `npm i <pkg> -w @vgmo/web`.
- Use Node LTS and execute commands from the repository root.

## Project Structure & Module Organization
- Monorepo using npm workspaces: `packages/*` and `services/*`.
- `packages/ui` — Preact UI library with Storybook. Source in `src`, build to `lib`, stories `*.stories.tsx`.
- `services/web` — Astro site using the UI package. Code in `src`, tests in `tests`.
- `services/crawler` — Node/TypeScript crawler. Code in `src`, tests in `tests`, build to `lib`.
- Root config: `biome.json` (lint/format), `cspell.json` (spelling), `tsconfig.json`, `.pre-commit-config.yaml`.

## Build, Test, and Development Commands
- Install: `npm ci`
- Build all workspaces: `npm run build`
- Test all workspaces: `npm test`
- UI Storybook (dev/build): `npm run storybook -w @vgmo/ui`, `npm run build-storybook -w @vgmo/ui`
- UI tests + coverage: `npm test -w @vgmo/ui`
- Web dev/build/preview: `npm run -w @vgmo/web dev|build|preview`
- Crawler build/test/coverage: `npm run -w @vgmo/crawler build|test|coverage`

Tip: Use `-w <workspace>` for a single package, and `--workspaces` to target all.

## Coding Style & Naming Conventions
- Language: TypeScript; JSX via Preact (`jsx: react-jsx`, `jsxImportSource: preact`).
- Prefer TypeScript for all new code (`.ts`/`.tsx`) over JavaScript (`.js`/`.mjs`).
- Use strict typing (no implicit `any`); justify exceptions in PRs.
- When JS output is required, keep sources in TS and emit JS via the build.
- Formatter/Linter: Biome. Run locally with `biome ci .` or via pre-commit.
- Indentation: spaces; organize imports (enabled in `biome.json`).
- Components: PascalCase directories and files (e.g., `src/Button/`, `Button.stories.tsx`).
- Modules: prefer `ComponentName/index.tsx` entry files; keep `src/` for sources.

## Dependency Policy
- Do not add unnecessary libraries to any `package.json`.
- Prefer the Node.js/ECMAScript standard library first; try built‑ins before adding deps.
- If a dependency is truly needed, prefer packages already used in the repo (reuse existing deps in the workspace or another workspace) before introducing a new one.
- Evaluate new deps for maintenance, security, license, size/tree‑shaking, and TypeScript support.
- Scope dependencies to the specific workspace that needs them; only add to the root for shared tooling.
- In PRs that add a new dependency, include a brief justification and alternatives considered.

## Testing Guidelines
- UI: Storybook Test Runner (`npm test -w @vgmo/ui`) with coverage output (nyc + Storybook JSON).
- Web: Node test runner (`node --test`) via `npm test -w @vgmo/web`.
- Crawler: Node test runner with `--experimental-strip-types` via `npm test -w @vgmo/crawler`; coverage with `npm run -w @vgmo/crawler coverage` (c8).
- Test files: `*.test.ts`. Keep unit tests near `tests/` directories.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits (e.g., `feat(ui): add Button`, `fix(crawler): ...`, `chore(spell): ...`).
- PRs: include a clear summary, link related issues, and add screenshots for UI changes. Reference Storybook/Chromatic when relevant.
- CI: ensure Node CI passes (build + tests), Biome linting passes, and Chromatic checks (for UI) are green.

## Security & Tooling Tips
- Enable pre-commit hooks: `pre-commit install` (runs Biome, cspell, hadolint, secretlint).
- Do not commit secrets; secretlint will flag them. Stick to Node LTS (`lts/*`).

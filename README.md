# vgmo

[![codecov](https://codecov.io/gh/9renpoto/vgmo/graph/badge.svg?token=k4zcp3DlWp)](https://codecov.io/gh/9renpoto/vgmo)

Monorepo managed with npm workspaces containing:
- `packages/ui`: Preact UI component library with Storybook and tests
- `services/web`: Astro website using the UI package
- `services/crawler`: Node/TypeScript crawler service

## Table of Contents
- Requirements
- Installation
- Quick Start
- Development
- Workspaces
- Testing
- Linting & Formatting
- Project Structure
- Contributing
- Security
- License

## Requirements
- Node.js 20+ recommended
  - For `services/crawler` tests using `--experimental-strip-types`, Node.js 22+ is required
- npm (bundled with Node)
- Git
- Optional: Docker (for the `secretlint` pre-commit hook)

## Installation
Run all commands from the repository root.

```sh
npm ci
```

Install pre-commit hooks (recommended):

```sh
pre-commit install
```

## Quick Start
- Build all workspaces: `npm run build`
- Run the website (Astro) in dev: `npm run -w @vgmo/web dev`
- Open Storybook for UI: `npm run -w @vgmo/ui storybook`

## Development
- Use Node LTS (20+) and run commands at the repo root
- Add dependencies to a specific workspace with `-w`, e.g. `npm i <pkg> -w @vgmo/web`
- Keep changes scoped to a single workspace when possible

## Workspaces
- This repository is a monorepo managed by npm workspaces
- Workspaces: `packages/*`, `services/*`
- Run in a specific workspace: `npm run -w <name> <script>` (e.g., `npm run -w @vgmo/ui build`)
- Run across all workspaces: `npm run <script> --workspaces` (e.g., `npm run build --workspaces`)

## Testing
- Run all tests: `npm test`
- UI package: `npm test -w @vgmo/ui` (Storybook test runner + coverage)
- Web service: `npm test -w @vgmo/web` (Node test runner)
- Crawler service: `npm test -w @vgmo/crawler` (Node test runner; Node 22+ for `--experimental-strip-types`)

## Linting & Formatting
- Biome is used for linting/formatting. Run: `biome ci .`
- Spelling checks via `cspell`: `npx cspell .`
- Pre-commit hooks run Biome, cspell, hadolint, and secretlint

## Project Structure
- `packages/ui/` — Preact components, stories in `src/**/Component.stories.tsx`, build to `lib/`
- `services/web/` — Astro app, pages/layouts/components under `src/`, tests in `tests/`
- `services/crawler/` — Node/TypeScript crawler, source in `src/`, tests in `tests/`, build to `lib/`
- Config: `biome.json`, `cspell.json`, `tsconfig.json`, `.pre-commit-config.yaml`

## Contributing
See `.github/CONTRIBUTING.md` for guidelines (branching, code style, testing, and PR checklist).

## Security
See `SECURITY.md` for the security policy and reporting.

## License
MIT — see `LICENSE`.

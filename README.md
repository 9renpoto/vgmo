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
- Pre-review Checklist
- Project Structure
- Contributing
- Security
- License

## Requirements
- Node.js 20.6+ recommended. This project uses the native TypeScript compiler (`@typescript/native-preview`), aliased as `tsgo`.
- For `services/crawler` tests using the `--experimental-strip-types` flag, Node.js 22+ is required.
- npm (bundled with Node).
- Git.

## Installation
Run all commands from the repository root.

```sh
npm ci
```

Install Git hooks with Lefthook (recommended):

```sh
npx lefthook install
```

## Quick Start
- Build all workspaces: `npm run build --workspaces`
- Run the website (Astro) in dev mode: `npm run dev -w @vgmo/web`
- Open Storybook for the UI package: `npm run storybook -w @vgmo/ui`
- Run the crawler: `npm run crawl`

## Development
- Use an LTS version of Node.js (20.6+) and run all commands from the repository root.
- Add dependencies to a specific workspace using the `-w` flag (e.g., `npm install <package> -w @vgmo/web`).
- Keep changes scoped to a single workspace whenever possible.
- This project uses `@typescript/native-preview` (aliased as `tsgo`) for compiling TypeScript. Running `npm run build -w <workspace>` delegates to `tsgo --build`.

## Workspaces
- This repository is a monorepo managed by npm workspaces.
- Workspaces are defined in `packages/*` and `services/*`.
- Run a script in a specific workspace: `npm run -w <name> <script>` (e.g., `npm run build -w @vgmo/ui`).
- Run a script across all workspaces: `npm run <script> --workspaces` (e.g., `npm run build --workspaces`).

## Testing
- Run all tests across all workspaces: `npm test --workspaces`
- UI package: `npm test -w @vgmo/ui` (Storybook test runner + coverage)
- Web service: `npm test -w @vgmo/web` (Node.js test runner)
- Crawler service: `npm test -w @vgmo/crawler` (Node.js test runner; requires Node.js 22+ for `--experimental-strip-types`)

## Linting & Formatting
- [Biome](https://biomejs.dev/) is used for linting and formatting. Run `npx biome ci .` to check the entire project.
- Spelling is checked with [cSpell](https://cspell.org/). Run `npx cspell .` to check.
- If you installed the Git hooks using Lefthook, Biome will run automatically on every commit.

## Pre-review Checklist
Before submitting a pull request, please ensure the following commands succeed on a clean tree:

```sh
# Build all workspaces
npm run build --workspaces

# Run all tests
npm test --workspaces

# Check formatting, linting, and imports
npx biome ci .
```

## Project Structure
- `packages/ui/` — Preact components. Stories are located in `src/**/Component.stories.tsx`, and builds are emitted to `lib/`.
- `services/web/` — Astro application. Pages, layouts, and components are under `src/`. Tests are in `tests/`.
- `services/crawler/` — Node.js/TypeScript crawler. Source code is in `src/`, tests are in `tests/`, and builds are emitted to `lib/`.
- Root-level configuration: `biome.json`, `cspell.json`, `tsconfig.json`, `lefthook.yml`.

## Contributing
See `.github/CONTRIBUTING.md` for guidelines (branching, code style, testing, and PR checklist).

## Security
See `SECURITY.md` for the security policy and how to report vulnerabilities.

## License
MIT — see `LICENSE`.
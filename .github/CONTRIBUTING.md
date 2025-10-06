# Contributing Guide

Thank you for contributing! This repository is a monorepo managed with npm workspaces. For day-to-day structure, commands, and coding conventions, see AGENTS.md.

- Project structure, workspace usage, commands, and style: see `AGENTS.md`.
- Security reporting and policies: see `SECURITY.md`.

## Prerequisites
- Node.js 20+ (Node 22+ required to run crawler tests with `--experimental-strip-types`)
- npm and Git installed
- [lefthook](https://github.com/evilmartians/lefthook)
- [biome](https://biomejs.dev/)

## Setup
```sh
npm ci
lefthook install
```

To ensure code quality, please run `biome check --apply .` before committing.

## Branching, Commits, and PRs
- Use feature branches (e.g., `feat/ui-button`, `fix/web-login`).
- Follow Conventional Commits, e.g.:
  - `feat(ui): add Button`
  - `fix(crawler): handle empty feed`
- Keep PRs small and focused; include tests and screenshots for UI changes.

## Common Tasks (Workspaces)
- Build all: `npm run build --workspaces`
- Test all: `npm test --workspaces`
- Run one workspace: `npm run -w <name> <script>` (e.g., `npm run -w @vgmo/web dev`)
- Add dependency to a workspace: `npm i <pkg> -w <name>`

## Testing
- UI: `npm test -w @vgmo/ui` (Storybook test runner + coverage)
- Web: `npm test -w @vgmo/web`
- Crawler: `npm test -w @vgmo/crawler` (Node 22+)

## Documentation
- Root documentation: keep `README.md`, `AGENTS.md`, and this guide up to date.
- Each workspace manages its own `README.md` with setup and usage details under `services/*` and `packages/*`.

## License
By contributing, you agree that your contributions are licensed under the MIT License (see `LICENSE`).


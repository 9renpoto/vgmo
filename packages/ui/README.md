# @vgmo/ui

Preact UI component library used by the vgmo monorepo, with Storybook and Storybook Test Runner for coverage.

## Requirements
- Node.js 20+
- npm

## Setup
Install dependencies at the repository root:

```sh
npm ci
```

## Scripts
- Build: `npm run -w @vgmo/ui build` (TypeScript build to `lib/`)
- Storybook (dev): `npm run -w @vgmo/ui storybook`
- Storybook (build): `npm run -w @vgmo/ui build-storybook`
- Test + coverage: `npm test -w @vgmo/ui`

## Development Notes
- Components are organized as `src/ComponentName/` with `index.tsx` and `ComponentName.stories.tsx`
- Styling via Twind (`twind.config.ts`)

## Contributing
Please read the repository contributing guide at `../../.github/CONTRIBUTING.md` and follow Conventional Commits.

## License
MIT — see repository `LICENSE`.

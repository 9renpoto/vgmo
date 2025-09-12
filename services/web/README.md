# @vgmo/web

Astro website that consumes the `@vgmo/ui` component library.

## Requirements
- Node.js 20+
- npm

## Setup
Install dependencies at the repository root:

```sh
npm ci
```

## Scripts
- Dev server: `npm run -w @vgmo/web dev`
- Build: `npm run -w @vgmo/web build`
- Preview: `npm run -w @vgmo/web preview`
- Type check: `npm run -w @vgmo/web check`
- Tests: `npm test -w @vgmo/web`

## Notes
- Uses Astro 5 and Preact integration
- UI components are imported from `@vgmo/ui`

### Data ingestion (crawler → web)
- Web reads concerts from a JSON file at build time.
- Default path: `public/data/concerts.json` (array of `ConcertInfo` from `@vgmo/types`).
- You can override the path with env `CONCERTS_JSON` (absolute or relative file URL).
- Shape: `[{ title, date, venue, ticketUrl, sourceUrl }]`.
- Slugs and OGP image are derived in `src/lib/concerts.ts`.

Example `public/data/concerts.json`:
```json
[
  {
    "title": "...",
    "date": "2025年9月9日(火)",
    "venue": "サントリーホール 大ホール",
    "ticketUrl": "https://...",
    "sourceUrl": "http://..."
  }
]
```

## Contributing
Please read the repository contributing guide at `../../.github/CONTRIBUTING.md`.

## License
MIT — see repository `LICENSE`.

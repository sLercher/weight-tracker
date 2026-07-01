# Weight Tracker

A focused SvelteKit app for recording body weight entries, visualizing trends, and editing historical data.

## Stack

- SvelteKit + Svelte 5 runes
- Tailwind CSS v4
- Dexie (IndexedDB persistence)
- Chart.js (time-series chart rendering)
- ESLint + Prettier + svelte-check

## Quick Start

```sh
npm install
npm run dev
```

Production workflow:

```sh
npm run check
npm run lint
npm run build
```

## Scripts

- `npm run dev`: start local dev server
- `npm run check`: run Svelte diagnostics (`svelte-check`)
- `npm run lint`: run Prettier check + ESLint
- `npm run format`: auto-format source files
- `npm run build`: create production bundle
- `npm run preview`: preview production build locally

## Architecture

### Data Layer

- `src/lib/db.js`
- Single Dexie database: `weight-db`
- Table: `entries` with schema `++id,date`
- Public API:
  - `addEntry(value)`
  - `updateEntry(id, changes)`
  - `deleteEntry(id)`
  - `getEntries()`

### UI Composition

- `src/routes/+page.svelte`
  - top-level page composition
  - coordinates entry creation and table refresh
- `src/lib/input.svelte`
  - validates and submits new entries
  - reports save errors to the user
- `src/lib/table.svelte`
  - loads entries
  - manages selected point and date range
  - orchestrates chart + trend + edit card subcomponents

### Chart and Trend Logic

- `src/lib/table/chart-logic.js`
  - pure utility functions for sorting/filtering and trend computation
- `src/lib/table/weight-chart.svelte`
  - renders data and trend datasets with Chart.js
  - emits selection events to parent state

## Engineering Notes

- Prefer small, pure utility functions for business logic (`chart-logic.js`) and keep components focused on rendering and event wiring.
- Keep async UI actions resilient:
  - surface user-safe error messages
  - avoid stale-load races when multiple refreshes happen quickly
- Follow runes mode patterns:
  - `$state` for mutable state
  - `$derived` for computed state
  - `$effect` for side effects

## Data Model

Entry shape:

```js
{
	id: number,
	value: number,
	date: Date
}
```

## Quality Checklist

Before merging changes:

1. `npm run check` passes with 0 errors/warnings.
2. `npm run lint` passes.
3. Manual smoke test:
   - add entry
   - select and edit point
   - delete point
   - switch ranges and verify chart/trend updates

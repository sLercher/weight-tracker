# Weight Tracker

Small personal project to track body weight over time.

This app is built for two goals:

- daily private use
- learning Svelte and SvelteKit with a realistic, manageable project

## What It Does

- Add a weight entry with date/time
- View entries in a table
- Visualize trends in a chart
- Edit and delete historical entries
- Filter visible data by time range
- Work as an installable PWA with offline asset caching

## Tech Stack

- SvelteKit 2 + Svelte 5 (runes mode)
- Tailwind CSS v4
- Dexie + IndexedDB (local persistence)
- Chart.js for chart rendering
- ESLint, Prettier, svelte-check

## Project Intent

This repository is intentionally small and practical. It favors clarity over abstraction so it can be used as a learning codebase while still being useful day to day.

## Getting Started

Requirements:

- Node.js 22+
- npm

Install and run locally:

    npm install
    npm run dev

Open the local URL shown by Vite in your terminal.

## Available Scripts

- npm run dev: Start local development server
- npm run check: Run Svelte diagnostics
- npm run check:watch: Run diagnostics in watch mode
- npm run lint: Run Prettier check and ESLint
- npm run format: Auto-format project files
- npm run build: Create production build
- npm run preview: Preview production build locally

## Data and Privacy

- Data is stored locally in your browser (IndexedDB).
- No backend or cloud sync is included.
- If you clear site data/browser storage, entries are lost.

If you plan to use this beyond personal experimentation, create a backup/export strategy first.

## PWA Notes

The app includes:

- Web app manifest at static/manifest.json
- Service worker at src/service-worker.js
- Prerendering for static hosting in src/routes/+layout.js

PWA install availability depends on browser requirements (HTTPS, valid manifest, active service worker, and engagement heuristics).

## Deploying to GitHub Pages

This project is configured for static deployment and includes a GitHub Actions workflow in .github/workflows/deploy.yml.

Manual build for a repo named weight-tracker:

PowerShell:

    $env:BASE_PATH='/weight-tracker'; npm run build

bash:

    BASE_PATH=/weight-tracker npm run build

Output is generated in the build directory.

The workflow uses BASE_PATH=/${{ github.event.repository.name }} so repo renames do not require workflow edits.

## Project Structure

- src/routes/+page.svelte: top-level page composition
- src/lib/input.svelte: add-entry form and validation
- src/lib/table.svelte: table, range controls, selected-entry flow
- src/lib/table/weight-chart.svelte: chart rendering and selection interaction
- src/lib/table/chart-logic.js: pure data and trend utilities
- src/lib/db.js: Dexie schema and CRUD API

## Quality Checklist

Before publishing:

1. Run npm run check
2. Run npm run lint
3. Run npm run build
4. Manually test add, edit, delete, and range switching
5. Verify install prompt or Add to Home Screen behavior in target browser

## Disclaimer

This is a personal tracking tool and learning project, not medical software. Do not use it as a substitute for professional medical advice.

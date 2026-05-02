# Demo Release Guide

Purpose: make the JCM Command Center app easy to demo and download from `main`.

## Current release outputs

Every push to `main` should produce two demo outputs:

1. A GitHub Actions build artifact named `jcm-command-center-demo`.
2. A GitHub Pages deployment from `.github/workflows/deploy-pages.yml`.

## Live demo link

Expected GitHub Pages URL:

```text
https://jcm-digital-coworker.github.io/JCM-Command-Center/
```

If the URL does not work yet, confirm GitHub Pages is enabled for this repository:

1. Open repository settings.
2. Open Pages.
3. Set source to GitHub Actions.
4. Re-run the `Deploy Demo` workflow.

## Downloadable demo build

1. Open the latest green `Build` workflow run.
2. Find the Artifacts section.
3. Download `jcm-command-center-demo`.
4. Unzip it.

The downloaded folder is a static Vite `dist` build. It is not a Windows installer or executable.

## Local preview of downloaded build

From inside the unzipped build folder, serve it with any static file server.

Examples:

```bash
npx serve .
```

or, from the repo after installing dependencies:

```bash
npm run preview
```

## Plant demo checklist

Before showing the plant:

- Build workflow is green.
- Deploy Demo workflow is green.
- GitHub Pages link opens on phone and desktop.
- Dashboard opens without blank screen.
- Quick Actions are visible.
- Embedded prompt cards are visible.
- Orders, Receiving, Coverage, QA / Safety, Maintenance, Plant Map, and department tabs open.
- `docs/ACTIVE_BAND_AIDS.md` has no open band-aids.

## Packaging roadmap

Phase 1: GitHub Pages demo link and downloadable static build artifact.

Phase 2: PWA install support for phone/tablet usage.

Phase 3: Desktop wrapper only if a Windows app is required.

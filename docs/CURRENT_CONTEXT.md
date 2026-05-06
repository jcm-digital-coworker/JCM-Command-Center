# JCM Command Center Current Context

Repo: jcm-digital-coworker/JCM-Command-Center
Branch: main
Framework: React, TypeScript, Vite
Build: npm run build

## Current Build State

- Latest recorded Action is GREEN.
- Run ID: 25408776708
- Source commit: efb12cd27b50b960251b01e32892341b21a30a36
- Branch: main
- Workflow: Build
- Updated: 2026-05-05T23:53:20Z
- Verified job: Typecheck and build succeeded.

## Last Completed Mission

Plant traveler action cleanup is complete.

Completed work:

- PR #38 merged the active plant traveler action projection.
- `src/logic/plantTravelerSelectors.ts` now owns active plant traveler action lookup helpers.
- Claude commit `efb12cd27b50b960251b01e32892341b21a30a36` updated `src/pages/departments/DepartmentPageTools.tsx` to use `getPlantTravelerMaterialAction(traveler)`.
- The old direct page-level `traveler.actions.find((action) => action.type === 'REQUEST_MATERIAL')` lookup is no longer the DepartmentPageTools material-action path.
- Latest Action run confirms the build is green after that cleanup.

## Current Mission

Move forward from the now-green plant traveler cleanup.

Recommended next target:

```text
Sweep repo memory and action handlers for stale references to the old plant traveler band-aid, then continue the next functional audit in small branches.
```

Primary next audit target:

```text
Remaining dashboard, traveler, operator-lane, receiving, engineering, and maintenance action handlers for text-inferred behavior, accidental runtime mutation, and route/copy mismatch.
```

## Stable Completed Work

- DEV toolkit is one bottom-right floating DEV button.
- DEV floater includes feature flags, role selector, department selector, and context/status access if present.
- Receiving gate page is active through a shim.
- `src/pages/ReceivingPage.ts` exports `./ReceivingGatePage`.
- `src/pages/ReceivingGatePage.tsx` contains the real gate-driven Receiving page.
- Active plant traveler action projection is explicit and green on main.
- Department order cards now use the plant traveler material-action selector instead of reaching directly into the projection.

## Important Architecture Decision

Actions belong to department traveler steps.

`PlantTraveler.actions` exists only as an active-step compatibility projection. New UI code should prefer selectors from:

```text
src/logic/plantTravelerSelectors.ts
```

Use:

```text
getActivePlantTravelerStep
getActivePlantTravelerActions
getPlantTravelerMaterialAction
```

Do not treat `PlantTraveler.actions` as independent plant-level truth.

## Protected Shared Files

- `src/App.tsx`
- `src/components/shell/AppDrawer.tsx`
- `src/components/shell/AppHeader.tsx`
- `src/components/shell/DevToolkitFlyout.tsx`

## Core Rules

- App.tsx mostly routes.
- Pages compose.
- Logic modules think.
- Components display.
- Prefer focused changes over giant rewrites.
- Verify builds after source changes.
- Pull current repo state before coding.
- Do not update large files from truncated connector output.
- Do not use compatibility projections as hidden new architecture.

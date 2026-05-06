# JCM Command Center Current Context

Repo: jcm-digital-coworker/JCM-Command-Center
Branch: main
Framework: React, TypeScript, Vite
Build: npm run build

## Current Build State

- Latest recorded Action is GREEN.
- Run ID: 25410617302
- Source commit: d2e2058765e63dd3fe4a0022198c1c61a17cc85d
- Branch: main
- Workflow: Build
- Updated: 2026-05-06T00:53:55Z
- Verified job: Typecheck and build succeeded.

## Last Completed Mission

Action-handler cleanup around workflow tablet buttons is complete.

Completed work:

- PR #39 kept `BLOCKED_HERE` workflow tablet cards review-only at the selector contract.
- `src/logic/workflowPanelSelectors.ts` now prevents blocked-at-this-station cards from falling through to `START_WORK` when packet status text is not exactly `BLOCKED`.
- PR #40 removed dead `safeButtonLabel()` display-layer guards from `src/components/WorkCenterWorkflowPanelV2.tsx`.
- Workflow panel button labels now render directly from typed selector contracts.
- No runtime behavior changed in PR #40.
- Latest Action run confirms the PR #40 merge commit is green on main.

## Current Mission

Move forward from the now-green action-handler cleanup.

Recommended next target:

```text
Continue the action-handler audit across dashboard, traveler, operator-lane, receiving, engineering, maintenance, and Plant Signals actions.
```

Primary next audit target:

```text
Find and remove remaining behavior inferred from visible labels, stale route assumptions, accidental runtime mutation, and copy that implies automatic resolution.
```

## Stable Completed Work

- DEV toolkit is one bottom-right floating DEV button.
- DEV floater includes feature flags, role selector, department selector, and context/status access if present.
- Receiving gate page is active through a shim.
- `src/pages/ReceivingPage.ts` exports `./ReceivingGatePage`.
- `src/pages/ReceivingGatePage.tsx` contains the real gate-driven Receiving page.
- Active plant traveler action projection is explicit and green on main.
- Department order cards use the plant traveler material-action selector instead of reaching directly into the projection.
- Work Center workflow buttons use typed action contracts, not visible-label parsing.
- `BLOCKED_HERE` workflow cards are review-only.
- `WorkCenterWorkflowPanelV2.tsx` no longer carries the dead `safeButtonLabel()` text-transform shim.

## Important Architecture Decisions

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

Workflow tablet button behavior belongs to typed selector contracts from:

```text
src/logic/workflowPanelSelectors.ts
```

Visible button text should render the contract, not decide runtime behavior.

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
- Do not infer runtime action behavior from display copy.
- Review-only actions must not clear blockers or mutate production state.
